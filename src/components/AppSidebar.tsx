import { MessageSquare, Users, BarChart3, Settings, Bell, Inbox, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useConversations } from "@/hooks/use-data";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Inbox", url: "/", icon: Inbox },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { data: conversations = [] } = useConversations();
  const { user, signOut } = useAuth();
  const waitingCount = conversations.filter(c => c.status === "waiting_agent").length;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border min-h-screen">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-accent-foreground">Velora AI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.title === "Inbox" && waitingCount > 0 && (
                <span className="notification-dot" />
              )}
            </div>
            <span>{item.title}</span>
            {item.title === "Inbox" && waitingCount > 0 && (
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
                {waitingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-sm font-medium">
            {(user?.email?.[0] ?? "A").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              {user?.user_metadata?.display_name || user?.email || "Agent"}
            </p>
            <p className="text-xs text-sidebar-foreground truncate">Online</p>
          </div>
          <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
