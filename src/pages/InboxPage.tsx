import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConversationList } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";
import { useConversations, useMessages } from "@/hooks/use-data";
import { subscribeToConversations } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Loader2 } from "lucide-react";

const InboxPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: conversations = [], isLoading } = useConversations();
  const { data: messages = [] } = useMessages(selectedId);
  const selectedConv = conversations.find(c => c.id === selectedId);
  const queryClient = useQueryClient();

  // Realtime subscription for conversation updates
  useEffect(() => {
    const channel = subscribeToConversations(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return (
    <DashboardLayout title="Inbox">
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-full md:w-96 border-r border-border flex-shrink-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>

        <div className="hidden md:flex flex-1">
          {selectedConv ? (
            <div className="flex-1">
              <ChatView conversation={selectedConv} messages={messages} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InboxPage;
