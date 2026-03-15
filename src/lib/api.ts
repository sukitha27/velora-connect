import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;
export type Lead = Tables<"leads">;

export async function fetchConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateLeadStatus(id: string, status: Lead["status"]) {
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function sendAgentMessage(conversationId: string, phoneNumber: string, message: string) {
  const { data, error } = await supabase.functions.invoke("send-message", {
    body: { conversation_id: conversationId, phone_number: phoneNumber, message },
  });
  if (error) throw error;
  return data;
}

export async function getAnalytics() {
  const { count: totalConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true });

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const { count: activeUsers } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { data: leadsByStatus } = await supabase
    .from("leads")
    .select("status");

  const statusCounts = (leadsByStatus || []).reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalConversations: totalConversations || 0,
    totalLeads: totalLeads || 0,
    activeUsers: activeUsers || 0,
    leadsByStatus: [
      { status: "New", count: statusCounts["new"] || 0 },
      { status: "Waiting", count: statusCounts["waiting_agent"] || 0 },
      { status: "Contacted", count: statusCounts["contacted"] || 0 },
      { status: "Converted", count: statusCounts["converted"] || 0 },
    ],
  };
}

export function subscribeToConversations(callback: (payload: unknown) => void) {
  return supabase
    .channel("conversations-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, callback)
    .subscribe();
}

export async function fetchSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("*");
  if (error) throw error;
  const map: Record<string, string> = {};
  (data || []).forEach((row: any) => { map[row.key] = row.value; });
  return map;
}

export async function saveSettings(settings: Record<string, string>) {
  for (const [key, value] of Object.entries(settings)) {
    const { error } = await supabase
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) throw error;
  }
}

export function subscribeToMessages(conversationId: string, callback: (payload: unknown) => void) {
  return supabase
    .channel(`messages-${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      callback
    )
    .subscribe();
}
  return supabase
    .channel(`messages-${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      callback
    )
    .subscribe();
}
