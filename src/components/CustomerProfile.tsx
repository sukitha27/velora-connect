import { useState } from "react";
import {
  X,
  Phone,
  MessageSquare,
  Clock,
  User,
  StickyNote,
  CheckCircle,
  Bot,
  Headphones,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Conversation, Message } from "@/lib/api";

interface Props {
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
}

const NOTES_KEY = (id: string) => `velora_notes_${id}`;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const senderIcon = { user: User, bot: Bot, agent: Headphones };
const senderLabel = { user: "Customer", bot: "AI Bot", agent: "Agent" };

export function CustomerProfile({ conversation, messages, onClose }: Props) {
  const [note, setNote] = useState(() => {
    try { return localStorage.getItem(NOTES_KEY(conversation.id)) || ""; } catch { return ""; }
  });
  const [noteSaved, setNoteSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const saveNote = () => {
    try {
      localStorage.setItem(NOTES_KEY(conversation.id), note);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {}
  };

  const initials = (conversation.customer_name || conversation.phone_number)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusClasses: Record<string, string> = {
    active: "badge-new",
    waiting_agent: "badge-waiting",
    resolved: "badge-converted",
    bot: "badge-contacted",
  };

  const userMessages = messages.filter((m) => m.sender_type === "user").length;
  const botMessages = messages.filter((m) => m.sender_type === "bot").length;
  const agentMessages = messages.filter((m) => m.sender_type === "agent").length;

  return (
    <div className="flex flex-col h-full border-l border-border bg-card animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
        <span className="text-[13px] font-semibold text-foreground">Customer Profile</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Avatar & name */}
        <div className="px-4 py-5 text-center border-b border-border">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary text-lg font-bold flex items-center justify-center mx-auto mb-3">
            {initials}
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">
            {conversation.customer_name || "Unknown"}
          </h3>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-[12px] text-muted-foreground">
            <Phone className="w-3 h-3" />
            {conversation.phone_number}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2.5">
            <span className={statusClasses[conversation.status]}>
              {conversation.status.replace("_", " ")}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {conversation.chat_mode === "bot" ? "🤖 Bot mode" : "✋ Manual mode"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-b border-border">
          {[
            { label: "Messages", value: messages.length, icon: MessageSquare },
            { label: "From customer", value: userMessages, icon: User },
            { label: "From agent", value: agentMessages + botMessages, icon: Headphones },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center py-3 gap-1 border-r border-border last:border-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground tabular">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{stat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="px-4 py-3 border-b border-border">
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>First contact: {new Date(conversation.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-3 h-3 flex-shrink-0" />
              <span>Last activity: {timeAgo(conversation.updated_at)}</span>
            </div>
            {conversation.assigned_agent_id && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Headphones className="w-3 h-3 flex-shrink-0" />
                <span>Agent assigned</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[12px] font-semibold text-foreground">Agent Notes</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add private notes about this customer…"
            rows={3}
            className="w-full bg-muted rounded-lg px-3 py-2 text-[12px] outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground resize-none"
          />
          <button
            onClick={saveNote}
            className={`mt-1.5 w-full py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              noteSaved
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            {noteSaved ? (
              <span className="flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" /> Saved
              </span>
            ) : (
              "Save Note"
            )}
          </button>
        </div>

        {/* Message history */}
        <div className="px-4 py-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-[12px] font-semibold text-foreground"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Recent Messages
            </span>
            {showHistory ? (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2 max-h-48 overflow-auto">
              {messages.slice(-10).reverse().map((msg) => {
                const Icon = senderIcon[msg.sender_type];
                return (
                  <div key={msg.id} className="flex gap-2 items-start">
                    <Icon className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground mb-0.5">
                        {senderLabel[msg.sender_type]} · {timeAgo(msg.created_at)}
                      </p>
                      <p className="text-[12px] text-foreground line-clamp-2 leading-snug">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
