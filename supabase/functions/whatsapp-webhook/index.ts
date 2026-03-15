import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { phone_number, customer_name, message, sender_type = "user" } = body;

    if (!phone_number || !message) {
      return new Response(
        JSON.stringify({ error: "phone_number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("phone_number", phone_number)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          phone_number,
          customer_name: customer_name || phone_number,
          last_message: message,
          status: "active",
        })
        .select("id")
        .single();

      if (convError) throw convError;
      conversation = newConv;
    } else {
      // Update last message and status
      const updateData: Record<string, string> = { last_message: message };
      if (customer_name) updateData.customer_name = customer_name;
      
      // If user asks for agent, set status
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("speak to") || lowerMsg.includes("human") || lowerMsg.includes("agent")) {
        updateData.status = "waiting_agent";
      }

      await supabase
        .from("conversations")
        .update(updateData)
        .eq("id", conversation.id);
    }

    // Insert message
    const { error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        phone_number,
        message,
        sender_type,
      });

    if (msgError) throw msgError;

    // Auto-create lead if status is waiting_agent
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("speak to") || lowerMsg.includes("human") || lowerMsg.includes("agent")) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("phone_number", phone_number)
        .limit(1)
        .single();

      if (!existingLead) {
        await supabase.from("leads").insert({
          phone_number,
          customer_name: customer_name || phone_number,
          status: "waiting_agent",
          conversation_id: conversation.id,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, conversation_id: conversation.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
