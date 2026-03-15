import { useState } from "react";
import { Message, Conversation } from "@/lib/mock-data";
import { Send, Bot, User, Headphones, Phone } from "lucide-react";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const senderConfig = {
  user: { icon: User, label: "Customer", bubbleClass: "bg-chat-user text-foreground", align: "items-start" },
  bot: { icon: Bot, label: "Bot", bubbleClass: "bg-chat-bot text-foreground", align: "items-end" },
  agent: { icon: Headphones, label: "Agent", bubbleClass: "bg-chat-agent text-foreground", align: "items-end" },
};

interface Props {
  conversation: Conversation;
  messages: Message[];
}

export function ChatView({ conversation, messages }: Props) {
  const [reply, setReply] = useState("");

  const handleSend = () => {
    if (!reply.trim()) return;
    // In production, this would trigger an API call to n8n webhook
    console.log("Sending reply via n8n webhook:", { conversation_id: conversation.id, message: reply });
    setReply("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{conversation.customer_name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              {conversation.phone_number}
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Claim Conversation
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {messages.map(msg => {
          const config = senderConfig[msg.sender_type];
          const Icon = config.icon;
          const isUser = msg.sender_type === "user";
          return (
            <div key={msg.id} className={`flex flex-col ${config.align}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
              </div>
              <div className={`${config.bubbleClass} rounded-2xl px-4 py-2.5 max-w-[75%] text-sm leading-relaxed ${
                isUser ? "rounded-tl-sm" : "rounded-tr-sm"
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply input */}
      <div className="px-6 py-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Type a reply..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!reply.trim()}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
