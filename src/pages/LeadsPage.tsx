import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { mockLeads, Lead } from "@/lib/mock-data";
import { Phone, Calendar, ChevronDown } from "lucide-react";

const statusOptions: Lead["status"][] = ["new", "waiting_agent", "contacted", "converted"];
const statusLabels: Record<string, string> = {
  new: "New",
  waiting_agent: "Waiting Agent",
  contacted: "Contacted",
  converted: "Converted",
};
const statusClasses: Record<string, string> = {
  new: "badge-new",
  waiting_agent: "badge-waiting",
  contacted: "badge-contacted",
  converted: "badge-converted",
};

const LeadsPage = () => {
  const [leads, setLeads] = useState(mockLeads);

  const updateStatus = (id: string, status: Lead["status"]) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  return (
    <DashboardLayout title="Leads">
      <div className="p-6">
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Lead Management</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Customers who requested human assistance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-sm text-foreground">{lead.customer_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {lead.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value as Lead["status"])}
                          className={`${statusClasses[lead.status]} appearance-none cursor-pointer pr-6 border-0 outline-none`}
                        >
                          {statusOptions.map(s => (
                            <option key={s} value={s}>{statusLabels[s]}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
