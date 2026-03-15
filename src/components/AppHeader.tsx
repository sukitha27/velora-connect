import { Menu, Bell, Search } from "lucide-react";
import { useConversations } from "@/hooks/use-data";

export function AppHeader({ title }: { title: string }) {
  const { data: conversations = [] } = useConversations();
  const waitingCount = conversations.filter(c => c.status === "waiting_agent").length;

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg hover:bg-muted">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center bg-muted rounded-lg px-3 py-2 gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="bg-transparent text-sm outline-none w-48 placeholder:text-muted-foreground"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-muted">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {waitingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />}
        </button>
      </div>
    </header>
  );
}
