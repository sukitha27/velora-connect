import { useState } from "react";
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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type FilterTab = "all" | "waiting_agent" | "active" | "bot" | "resolved";

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "waiting_agent", label: "Waiting" },
  { key: "active", label: "Active" },
  { key: "bot", label: "Bot" },
  { key: "resolved", label: "Resolved" },
];

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery?: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery = "",
}: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const waitingCount = conversations.filter(
    (c) => c.status === "waiting_agent"
  ).length;

  const filtered = conversations.filter((c) => {
    const matchesTab = activeTab === "all" || c.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (c.customer_name || "").toLowerCase().includes(q) ||
      c.phone_number.toLowerCase().includes(q) ||
      (c.last_message || "").toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Conversations
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-1">
            {conversations.length}
          </span>
        </h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const count =
            tab.key === "all"
              ? conversations.length
              : conversations.filter((c) => c.status === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1 rounded-full ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
              {tab.key === "waiting_agent" && waitingCount > 0 && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-destructive ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {searchQuery
              ? `No conversations match "${searchQuery}"`
              : activeTab === "all"
                ? "No conversations yet. Messages from WhatsApp will appear here."
                : `No ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} conversations.`}
          </div>
        )}
        {filtered.map((conv) => {
          const status = statusConfig[conv.status] || statusConfig.active;
          const isWaiting = conv.status === "waiting_agent";
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-border hover:bg-muted/50 transition-colors ${
                selectedId === conv.id
                  ? "bg-primary/5 border-l-2 border-l-primary"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {isWaiting && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse-soft" />
                  )}
                  <span className="font-medium text-sm text-foreground truncate">
                    {conv.customer_name || conv.phone_number}
                  </span>
                </div>
                <span className={`${status.class} flex-shrink-0 ml-2`}>
                  {status.label}
                </span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-xs text-muted-foreground mb-1 ${isWaiting ? "ml-4" : ""}`}
              >
                <Phone className="w-3 h-3" />
                {conv.phone_number}
              </div>
              {conv.last_message && (
                <p
                  className={`text-sm text-muted-foreground truncate ${isWaiting ? "ml-4" : ""}`}
                >
                  {conv.last_message}
                </p>
              )}
              <div
                className={`flex items-center gap-1 text-xs text-muted-foreground mt-1.5 ${isWaiting ? "ml-4" : ""}`}
              >
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
