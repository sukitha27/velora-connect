import { useState, useEffect } from "react";
import { Message, Conversation, subscribeToMessages, updateChatMode, getAiSuggestion } from "@/lib/api";
import { useSendMessage, useClaimConversation } from "@/hooks/use-data";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Bot, User, Headphones, Phone, Loader2, UserCheck, Sparkles, Hand } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const senderConfig = {
  user: { icon: User, label: "Customer", bubbleClass: "bg-chat-user text-foreground", align: "items-start" },
  bot: { icon: Bot, label: "Bot", bubbleClass: "bg-chat-bot text-foreground", align: "items-end" },
  agent: { icon: Headphones, label: "Agent", bubbleClass: "bg-chat-agent text-foreground", align: "items-end" },
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
  const sendMessage = useSendMessage();
  const claimConversation = useClaimConversation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isClaimed = !!conversation.assigned_agent_id;
  const isClaimedByMe = conversation.assigned_agent_id === user?.id;

  useEffect(() => {
    setIsBotMode((conversation as any).chat_mode === "bot");
  }, [conversation.id]);

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
    } catch (err) {
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
      toast.success("AI suggestion ready — edit or send it!");
    } catch (err) {
      toast.error("Failed to get AI suggestion");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleSend = () => {
    if (!reply.trim() || sendMessage.isPending) return;
    sendMessage.mutate(
      { conversationId: conversation.id, phoneNumber: conversation.phone_number, message: reply },
      {
        onSuccess: () => { setReply(""); setAiSuggestion(null); toast.success("Message sent"); },
        onError: (err) => { toast.error("Failed to send: " + (err as Error).message); },
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
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{conversation.customer_name || conversation.phone_number}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{conversation.phone_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Chat mode toggle */}
            <div className="flex items-center gap-2">
              <Hand className={`w-4 h-4 ${!isBotMode ? "text-primary" : "text-muted-foreground"}`} />
              <Switch checked={isBotMode} onCheckedChange={handleToggleMode} />
              <Bot className={`w-4 h-4 ${isBotMode ? "text-primary" : "text-muted-foreground"}`} />
            </div>

            {isClaimed ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                <UserCheck className="w-3.5 h-3.5" />
                {isClaimedByMe ? "You" : "Claimed"}
              </div>
            ) : (
              <button
                onClick={handleClaim}
                disabled={claimConversation.isPending}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {claimConversation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Claim"}
              </button>
            )}
          </div>
        </div>

        {/* Mode indicator bar */}
        <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${
          isBotMode ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}>
          {isBotMode ? (
            <>
              <Bot className="w-3.5 h-3.5" />
              <span>AI Bot Mode — auto-replies enabled</span>
            </>
          ) : (
            <>
              <Hand className="w-3.5 h-3.5" />
              <span>Manual Mode — you control all replies</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 md:px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">No messages yet</div>
        )}
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
                <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
              </div>
              <div className={`${config.bubbleClass} rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] text-sm leading-relaxed ${
                isUser ? "rounded-tl-sm" : "rounded-tr-sm"
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border bg-card">
        {aiSuggestion && (
          <div className="mb-2 text-xs text-muted-foreground flex items-center gap-1.5 px-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI suggestion loaded — edit below or send as-is</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {!isBotMode && (
            <button
              onClick={handleSuggest}
              disabled={isLoadingSuggestion}
              className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
              title="Get AI suggestion"
            >
              {isLoadingSuggestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          )}
          <input
            type="text"
            value={reply}
            onChange={e => { setReply(e.target.value); if (aiSuggestion) setAiSuggestion(null); }}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={isBotMode ? "AI is auto-replying... (or type to override)" : "Type a reply..."}
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!reply.trim() || sendMessage.isPending}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
