import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle Meta webhook verification (GET request)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    } else {
      console.error("Webhook verification failed");
      return new Response("Forbidden", { status: 403 });
    }
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();

    // Handle Meta webhook format
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field !== "messages") continue;
          const value = change.value;

          // Process incoming messages
          for (const msg of value.messages || []) {
            const phone_number = msg.from;
            const message = msg.text?.body || "[unsupported message type]";
            const customer_name =
              value.contacts?.[0]?.profile?.name || phone_number;

            await processIncomingMessage(supabase, {
              phone_number,
              message,
              customer_name,
              sender_type: "user",
            });
          }

          // Process message statuses (delivered, read, etc.) — log only
          for (const status of value.statuses || []) {
            console.log(`Message ${status.id} status: ${status.status}`);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Legacy format support (direct POST with phone_number + message)
    const { phone_number, customer_name, message, sender_type = "user" } = body;
    if (!phone_number || !message) {
      return new Response(
        JSON.stringify({ error: "phone_number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await processIncomingMessage(supabase, { phone_number, message, customer_name, sender_type });

    return new Response(
      JSON.stringify({ success: true }),
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

async function processIncomingMessage(
  supabase: ReturnType<typeof createClient>,
  { phone_number, message, customer_name, sender_type }: {
    phone_number: string;
    message: string;
    customer_name?: string;
    sender_type: string;
  }
) {
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
    const updateData: Record<string, string> = { last_message: message };
    if (customer_name) updateData.customer_name = customer_name;

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

  // Auto-create lead if requesting agent
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
}
