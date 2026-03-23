import { DashboardLayout } from "@/components/DashboardLayout";
import { useLeads, useUpdateLeadStatus } from "@/hooks/use-data";
import { Phone, Calendar, ChevronDown, Loader2, Users, Search } from "lucide-react";
import { useState } from "react";

const statusOptions = ["new", "waiting_agent", "contacted", "converted"] as const;
const statusLabels: Record<string, string> = {
  new: "New",
  waiting_agent: "Waiting",
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
  const { data: leads = [], isLoading } = useLeads();
  const updateStatus = useUpdateLeadStatus();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = leads.filter((lead) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (lead.customer_name || "").toLowerCase().includes(q) ||
      lead.phone_number.toLowerCase().includes(q);
    const matchesStatus =
      filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Leads">
      <div className="p-5 space-y-4 max-w-5xl">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="bg-transparent text-[13px] outline-none w-full placeholder:text-muted-foreground"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", ...statusOptions].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : statusLabels[s]}
              </button>
            ))}
          </div>

          <span className="ml-auto text-[12px] text-muted-foreground">
            {filtered.length} of {leads.length}
          </span>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading leads…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-[14px] font-medium text-foreground">No leads found</p>
              <p className="text-[13px] text-muted-foreground">
                {leads.length === 0
                  ? "Leads are created when customers request a human agent via WhatsApp."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {(lead.customer_name || lead.phone_number)[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-[13px] text-foreground">
                            {lead.customer_name || lead.phone_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {lead.phone_number}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative inline-flex items-center">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateStatus.mutate({
                                id: lead.id,
                                status: e.target.value,
                              })
                            }
                            className={`${statusClasses[lead.status]} appearance-none cursor-pointer pr-5 border-0 outline-none font-medium`}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground tabular">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
