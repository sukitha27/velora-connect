import { Bell, Search, X } from "lucide-react";
import { useConversations } from "@/hooks/use-data";

interface Props {
  title: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function AppHeader({ title, onSearch, searchQuery = "" }: Props) {
  const { data: conversations = [] } = useConversations();
  const waitingCount = conversations.filter(
    (c) => c.status === "waiting_agent"
  ).length;

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-5 gap-4 sticky top-0 z-10">
      <h1 className="text-[15px] font-semibold text-foreground tracking-tight flex-shrink-0">
        {title}
      </h1>

      <div className="flex items-center gap-2 ml-auto">
        {onSearch && (
          <div className={`hidden sm:flex items-center rounded-lg px-3 py-1.5 gap-2 transition-all duration-200 ${
            searchQuery
              ? "bg-primary/8 ring-1 ring-primary/20"
              : "bg-muted hover:bg-muted/80"
          }`}>
            <Search className={`w-3.5 h-3.5 flex-shrink-0 ${searchQuery ? "text-primary" : "text-muted-foreground"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search…"
              className="bg-transparent text-[13px] outline-none w-36 sm:w-48 placeholder:text-muted-foreground text-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="text-muted-foreground" style={{ width: 17, height: 17 }} />
          {waitingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
          )}
        </button>
      </div>
    </header>
  );
}
