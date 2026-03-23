import { Inbox, Users, BarChart3, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useConversations } from "@/hooks/use-data";

const navItems = [
  { title: "Inbox", url: "/", icon: Inbox },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const { data: conversations = [] } = useConversations();
  const waitingCount = conversations.filter((c) => c.status === "waiting_agent").length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-stretch">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.title === "Inbox" && waitingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
      {/* iPhone safe area spacer */}
      <div className="h-safe-bottom" />
    </nav>
  );
}
