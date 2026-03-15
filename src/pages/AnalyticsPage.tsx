import { DashboardLayout } from "@/components/DashboardLayout";
import { useAnalytics } from "@/hooks/use-data";
import { MessageSquare, Users, Zap, Clock, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["hsl(168, 80%, 36%)", "hsl(38, 92%, 50%)", "hsl(210, 80%, 55%)", "hsl(142, 70%, 45%)"];

const AnalyticsPage = () => {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: "Total Conversations", value: (analytics?.totalConversations || 0).toString(), icon: MessageSquare },
    { label: "Total Leads", value: (analytics?.totalLeads || 0).toString(), icon: Users },
    { label: "Active Conversations", value: (analytics?.activeUsers || 0).toString(), icon: Zap },
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {analytics && analytics.leadsByStatus.some(l => l.count > 0) && (
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Leads by Status</h3>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={analytics.leadsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="status">
                    {analytics.leadsByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {analytics.leadsByStatus.map((item, i) => (
                  <div key={item.status} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{item.status}</span>
                    <span className="font-medium text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(!analytics || !analytics.leadsByStatus.some(l => l.count > 0)) && (
          <div className="bg-card rounded-xl border border-border shadow-card p-6 text-center text-sm text-muted-foreground">
            Analytics will populate as conversations and leads come in via WhatsApp.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
