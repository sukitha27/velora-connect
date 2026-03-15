import { DashboardLayout } from "@/components/DashboardLayout";
import { analyticsData } from "@/lib/mock-data";
import { MessageSquare, Users, TrendingUp, Clock, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(168, 80%, 36%)", "hsl(38, 92%, 50%)", "hsl(210, 80%, 55%)", "hsl(142, 70%, 45%)"];

const stats = [
  { label: "Total Conversations", value: analyticsData.totalConversations.toLocaleString(), icon: MessageSquare, change: "+12.5%" },
  { label: "Total Leads", value: analyticsData.totalLeads.toLocaleString(), icon: Users, change: "+8.2%" },
  { label: "Active Users", value: analyticsData.activeUsers.toString(), icon: Zap, change: "+3.1%" },
  { label: "Avg Response Time", value: analyticsData.avgResponseTime, icon: Clock, change: "-15%" },
];

const AnalyticsPage = () => {
  return (
    <DashboardLayout title="Analytics">
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-success">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages per day chart */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Messages Per Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.messagesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 91%)",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                />
                <Bar dataKey="count" fill="hsl(168, 80%, 36%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by status */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Leads by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={analyticsData.leadsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="status"
                >
                  {analyticsData.leadsByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {analyticsData.leadsByStatus.map((item, i) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{item.status}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion rate */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Conversion Rate</h3>
            <span className="text-2xl font-bold text-primary">{analyticsData.conversionRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${analyticsData.conversionRate}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Leads converted to customers this month</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
