import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const META_API_URL = "https://graph.facebook.com/v21.0";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use getUser() — the correct Supabase SDK method
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { conversation_id, mode } = await req.json();
    // mode: "suggest" (return AI reply for agent review) or "auto" (send directly via WhatsApp)

    if (!conversation_id) {
      return new Response(
        JSON.stringify({ error: "conversation_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch conversation + recent messages for context
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .single();

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(50);

    // Build chat history for AI
    const chatMessages = (messages || []).map((m: any) => ({
      role: m.sender_type === "user" ? "user" : "assistant",
      content: m.message,
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are Velora AI, a friendly and professional WhatsApp customer support assistant. 
You help customers with their queries in a conversational, helpful manner.
Keep responses concise (under 200 words) and natural for WhatsApp messaging.
The customer's name is ${conversation.customer_name || "there"}.
Always be polite, empathetic, and solution-oriented.
If you don't know the answer, offer to connect them with a human agent.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatMessages,
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded, please try again later",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted, please add funds" }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const aiReply =
      aiData.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    // If mode is "suggest", just return the suggestion without sending
    if (mode === "suggest") {
      return new Response(JSON.stringify({ success: true, reply: aiReply }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mode "auto": send via WhatsApp and save to DB
    const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");

    if (whatsappToken && phoneId) {
      const metaResponse = await fetch(
        `${META_API_URL}/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: conversation.phone_number,
            type: "text",
            text: { body: aiReply },
          }),
        }
      );

      if (!metaResponse.ok) {
        const metaErr = await metaResponse.json();
        console.error("Meta API error:", JSON.stringify(metaErr));
      }
    }

    // Save bot message to DB
    await supabase.from("messages").insert({
      conversation_id,
      phone_number: conversation.phone_number,
      message: aiReply,
      sender_type: "bot",
    });

    await supabase
      .from("conversations")
      .update({ last_message: aiReply })
      .eq("id", conversation_id);

    return new Response(JSON.stringify({ success: true, reply: aiReply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
