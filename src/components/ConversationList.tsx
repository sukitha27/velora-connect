import { Conversation } from "@/lib/api";
import { Phone, Clock, MessageSquare } from "lucide-react";

const statusConfig: Record<string, { label: string; class: string }> = {
  waiting_agent: { label: "Waiting", class: "badge-waiting" },
  active: { label: "Active", class: "badge-new" },
  resolved: { label: "Resolved", class: "badge-converted" },
  bot: { label: "Bot", class: "badge-contacted" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Conversations
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-1">{conversations.length}</span>
        </h2>
      </div>
      <div className="flex-1 overflow-auto">
        {conversations.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No conversations yet. Messages from WhatsApp will appear here.
          </div>
        )}
        {conversations.map(conv => {
          const status = statusConfig[conv.status] || statusConfig.active;
          const isWaiting = conv.status === "waiting_agent";
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-border hover:bg-muted/50 transition-colors ${
                selectedId === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isWaiting && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse-soft" />}
                  <span className="font-medium text-sm text-foreground">{conv.customer_name || conv.phone_number}</span>
                </div>
                <span className={status.class}>{status.label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 ml-4">
                <Phone className="w-3 h-3" />
                {conv.phone_number}
              </div>
              {conv.last_message && (
                <p className="text-sm text-muted-foreground truncate ml-4">{conv.last_message}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 ml-4">
                <Clock className="w-3 h-3" />
                {timeAgo(conv.updated_at)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
