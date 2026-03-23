import {
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Inbox,
  LogOut,
  Radio,
} from "lucide-react";
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
  const waitingCount = conversations.filter(
    (c) => c.status === "waiting_agent"
  ).length;

  const initials = (user?.user_metadata?.display_name || user?.email || "A")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-sidebar-border"
      style={{ background: "hsl(var(--sidebar-background))" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(var(--sidebar-primary))" }}>
          <MessageSquare className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          {/* Live indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
            style={{ borderColor: "hsl(var(--sidebar-background))" }} />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-none tracking-tight"
            style={{ color: "hsl(var(--sidebar-accent-foreground))" }}>
            Velora AI
          </p>
          <p className="text-[11px] mt-0.5 tabular"
            style={{ color: "hsl(var(--sidebar-foreground))" }}>
            {waitingCount > 0
              ? `${waitingCount} waiting`
              : "All clear"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
            activeClassName="sidebar-active text-sidebar-accent-foreground"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <div className={`relative p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground"
                }`}>
                  <item.icon className="w-4 h-4" />
                  {item.title === "Inbox" && waitingCount > 0 && !isActive && (
                    <span className="notification-dot" />
                  )}
                </div>
                <span className={isActive ? "text-sidebar-accent-foreground" : ""}>
                  {item.title}
                </span>
                {item.title === "Inbox" && waitingCount > 0 && (
                  <span className="ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/90 text-white leading-none">
                    {waitingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status bar */}
      <div className="mx-3 mb-3 px-3 py-2.5 rounded-lg flex items-center gap-2"
        style={{ background: "hsl(var(--sidebar-accent))" }}>
        <Radio className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
        <span className="text-[11px] font-medium" style={{ color: "hsl(var(--sidebar-foreground))" }}>
          {conversations.filter(c => c.status === "active").length} active · {conversations.filter(c => c.chat_mode === "bot").length} on bot
        </span>
      </div>

      {/* User footer */}
      <div className="px-4 py-3.5 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
            style={{
              background: "hsl(var(--sidebar-primary) / 0.2)",
              color: "hsl(var(--sidebar-primary))",
            }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate leading-tight"
              style={{ color: "hsl(var(--sidebar-accent-foreground))" }}>
              {user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Agent"}
            </p>
            <p className="text-[11px] truncate"
              style={{ color: "hsl(var(--sidebar-foreground))" }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="p-1.5 rounded-lg transition-colors hover:bg-sidebar-accent"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
