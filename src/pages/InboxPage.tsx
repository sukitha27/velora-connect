import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConversationList } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";
import { mockConversations, mockMessages } from "@/lib/mock-data";
import { MessageSquare } from "lucide-react";

const InboxPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedConv = mockConversations.find(c => c.id === selectedId);
  const messages = selectedId ? (mockMessages[selectedId] || []) : [];

  return (
    <DashboardLayout title="Inbox">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation list */}
        <div className="w-full md:w-96 border-r border-border flex-shrink-0">
          <ConversationList
            conversations={mockConversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Chat view */}
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
