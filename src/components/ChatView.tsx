import { useState, useEffect, useRef } from "react";
import {
  Message,
  Conversation,
  subscribeToMessages,
  updateChatMode,
  getAiSuggestion,
} from "@/lib/api";
import { useSendMessage, useClaimConversation } from "@/hooks/use-data";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Send, Bot, User, Headphones, Phone, Loader2,
  UserCheck, Sparkles, Hand, Zap, UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { QuickReplies } from "@/components/QuickReplies";
import { CustomerProfile } from "@/components/CustomerProfile";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const senderConfig = {
  user:  { icon: User,      label: "Customer", bubbleClass: "bg-chat-user text-foreground",  align: "items-start" },
  bot:   { icon: Bot,       label: "Bot",      bubbleClass: "bg-chat-bot text-foreground",   align: "items-end"   },
  agent: { icon: Headphones,label: "Agent",    bubbleClass: "bg-chat-agent text-foreground", align: "items-end"   },
};

interface Props {
  conversation: Conversation & { chat_mode?: "manual" | "bot" };
  messages: Message[];
}

export function ChatView({ conversation, messages }: Props) {
  const [reply, setReply] = useState("");
  const [isBotMode, setIsBotMode] = useState((conversation as any).chat_mode === "bot");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const sendMessage = useSendMessage();
  const claimConversation = useClaimConversation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isClaimed = !!conversation.assigned_agent_id;
  const isClaimedByMe = conversation.assigned_agent_id === user?.id;

  useEffect(() => {
    setIsBotMode((conversation as any).chat_mode === "bot");
  }, [conversation.id, (conversation as any).chat_mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = subscribeToMessages(conversation.id, () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] });
    });
    return () => { channel.unsubscribe(); };
  }, [conversation.id, queryClient]);

  const handleToggleMode = async (checked: boolean) => {
    const newMode = checked ? "bot" : "manual";
    setIsBotMode(checked);
    try {
      await updateChatMode(conversation.id, newMode);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success(`Switched to ${checked ? "AI Bot" : "Manual"} mode`);
    } catch {
      setIsBotMode(!checked);
      toast.error("Failed to switch mode");
    }
  };

  const handleSuggest = async () => {
    setIsLoadingSuggestion(true);
    try {
      const suggestion = await getAiSuggestion(conversation.id);
      setAiSuggestion(suggestion);
      setReply(suggestion);
      toast.success("AI suggestion loaded");
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("credits")) toast.error("AI credits exhausted");
      else if (msg.includes("Rate limit")) toast.error("Too many requests, wait a moment");
      else toast.error("Failed to get AI suggestion");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleSend = () => {
    if (!reply.trim() || sendMessage.isPending) return;
    sendMessage.mutate(
      { conversationId: conversation.id, phoneNumber: conversation.phone_number, message: reply },
      {
        onSuccess: () => {
          setReply(""); setAiSuggestion(null); setShowQuickReplies(false);
          toast.success("Message sent");
        },
        onError: (err) => toast.error("Failed to send: " + (err as Error).message),
      }
    );
  };

  const handleClaim = () => {
    claimConversation.mutate(conversation.id, {
      onSuccess: () => toast.success("Conversation claimed"),
      onError: (err) => toast.error("Failed to claim: " + (err as Error).message),
    });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 md:px-5 py-3 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="min-w-0 text-left flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                {(conversation.customer_name || conversation.phone_number)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[14px] text-foreground truncate group-hover:text-primary transition-colors">
                  {conversation.customer_name || conversation.phone_number}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {conversation.phone_number}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Hand className={`w-3.5 h-3.5 ${!isBotMode ? "text-primary" : "text-muted-foreground"}`} />
                <Switch checked={isBotMode} onCheckedChange={handleToggleMode} />
                <Bot className={`w-3.5 h-3.5 ${isBotMode ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showProfile ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                }`}
                title="Customer profile"
              >
                <UserCircle className="w-4 h-4" />
              </button>

              {isClaimed ? (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-[11px] text-muted-foreground">
                  <UserCheck className="w-3 h-3" />
                  {isClaimedByMe ? "You" : "Claimed"}
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={claimConversation.isPending}
                  className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {claimConversation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Claim"}
                </button>
              )}
            </div>
          </div>

          <div className={`mt-2 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
            isBotMode ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {isBotMode
              ? <><Bot className="w-3 h-3" /> AI Bot Mode — auto-replies enabled</>
              : <><Hand className="w-3 h-3" /> Manual Mode — you control all replies</>
            }
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-4 md:px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-[13px] text-muted-foreground py-10">No messages yet</div>
          )}
          {messages.map((msg) => {
            const config = senderConfig[msg.sender_type];
            const Icon = config.icon;
            return (
              <div key={msg.id} className={`flex flex-col ${config.align} animate-slide-up`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium">{config.label}</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                </div>
                <div className={`${config.bubbleClass} rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[72%] text-[13px] leading-relaxed ${
                  msg.sender_type === "user" ? "rounded-tl-sm" : "rounded-tr-sm"
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply input */}
        <div className="px-4 md:px-5 py-3 border-t border-border bg-card flex-shrink-0">
          {aiSuggestion && (
            <div className="mb-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
              <Sparkles className="w-3 h-3 text-primary" />
              AI suggestion loaded — edit below or send as-is
            </div>
          )}

          <div className="relative">
            {showQuickReplies && (
              <QuickReplies
                onSelect={(text) => { setReply(text); setShowQuickReplies(false); }}
                onClose={() => setShowQuickReplies(false)}
              />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                  showQuickReplies ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="Quick replies (templates)"
              >
                <Zap className="w-4 h-4" />
              </button>

              {!isBotMode && (
                <button
                  onClick={handleSuggest}
                  disabled={isLoadingSuggestion}
                  className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 transition-colors disabled:opacity-40 flex-shrink-0"
                  title="Get AI suggestion"
                >
                  {isLoadingSuggestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
              )}

              <input
                type="text"
                value={reply}
                onChange={(e) => { setReply(e.target.value); if (aiSuggestion) setAiSuggestion(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isBotMode ? "AI is replying… type to override" : "Type a reply…"}
                className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground"
              />

              <button
                onClick={handleSend}
                disabled={!reply.trim() || sendMessage.isPending}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
              >
                {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile panel — desktop only */}
      {showProfile && (
        <div className="w-64 xl:w-72 flex-shrink-0 hidden md:block overflow-hidden">
          <CustomerProfile
            conversation={conversation}
            messages={messages}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}
    </div>
  );
}
