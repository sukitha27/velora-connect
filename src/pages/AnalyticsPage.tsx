import { DashboardLayout } from "@/components/DashboardLayout";
import { useAnalytics } from "@/hooks/use-data";
import { MessageSquare, Users, Zap, TrendingUp, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "hsl(161, 75%, 38%)",
  "hsl(36, 96%, 52%)",
  "hsl(213, 80%, 52%)",
  "hsl(142, 65%, 42%)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-elevated">
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">Count: <span className="text-foreground font-semibold tabular">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const { data: analytics, isLoading } = useAnalytics();

  const stats = [
    {
      label: "Total Conversations",
      value: analytics?.totalConversations ?? 0,
      icon: MessageSquare,
      color: "primary",
      trend: "All time",
    },
    {
      label: "Total Leads",
      value: analytics?.totalLeads ?? 0,
      icon: Users,
      color: "info",
      trend: "All time",
    },
    {
      label: "Active Now",
      value: analytics?.activeUsers ?? 0,
      icon: Zap,
      color: "success",
      trend: "Live",
    },
  ];

  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
  };

  return (
    <DashboardLayout title="Analytics">
      <div className="p-5 space-y-5 max-w-5xl">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground tabular tracking-tight">
                    {stat.value.toLocaleString()}
                  </p>
                )}
                <p className="text-[13px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Leads by status */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Leads by Status</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Funnel breakdown</p>
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>

            {isLoading ? (
              <div className="h-52 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : analytics && analytics.leadsByStatus.some((l) => l.count > 0) ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.leadsByStatus}
                      cx="40%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {analytics.leadsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-[12px] text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center gap-2 text-center">
                <Users className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-[13px] text-muted-foreground">No leads yet</p>
              </div>
            )}
          </div>

          {/* Summary table */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Status Summary</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Lead pipeline overview</p>
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {(analytics?.leadsByStatus || []).map((item, i) => {
                  const total = analytics?.leadsByStatus.reduce((s, l) => s + l.count, 0) || 1;
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                      <span className="text-[13px] text-muted-foreground flex-1">{item.status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: COLORS[i] }}
                          />
                        </div>
                        <span className="text-[13px] font-semibold text-foreground tabular w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {!isLoading && analytics?.totalConversations === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-foreground mb-1">No data yet</p>
            <p className="text-[13px] text-muted-foreground">
              Analytics populate automatically as WhatsApp conversations come in.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
