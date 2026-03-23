import { DashboardLayout } from "@/components/DashboardLayout";
import { useLeads, useUpdateLeadStatus } from "@/hooks/use-data";
import {
  Phone, Calendar, ChevronDown, Loader2, Users,
  Search, Download, CheckSquare, Square, Trash2,
  RefreshCw, X,
} from "lucide-react";
import { useState } from "react";
import { exportLeadsToCSV } from "@/lib/export";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const statusOptions = ["new", "waiting_agent", "contacted", "converted"] as const;
const statusLabels: Record<string, string> = {
  new: "New", waiting_agent: "Waiting", contacted: "Contacted", converted: "Converted",
};
const statusClasses: Record<string, string> = {
  new: "badge-new", waiting_agent: "badge-waiting",
  contacted: "badge-contacted", converted: "badge-converted",
};

const LeadsPage = () => {
  const { data: leads = [], isLoading } = useLeads();
  const updateStatus = useUpdateLeadStatus();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = leads.filter((lead) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (lead.customer_name || "").toLowerCase().includes(q) ||
      lead.phone_number.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Selection helpers
  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someSelected = filtered.some((l) => selected.has(l.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  // Bulk status update
  const handleBulkStatus = async (status: string) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const ids = [...selected];
      const { error } = await supabase
        .from("leads")
        .update({ status: status as any })
        .in("id", ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Updated ${ids.length} lead${ids.length > 1 ? "s" : ""} to "${statusLabels[status]}"`);
      clearSelection();
    } catch (err) {
      toast.error("Bulk update failed: " + (err as Error).message);
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const count = selected.size;
    if (!window.confirm(`Delete ${count} lead${count > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const ids = [...selected];
      const { error } = await supabase.from("leads").delete().in("id", ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Deleted ${count} lead${count > 1 ? "s" : ""}`);
      clearSelection();
    } catch (err) {
      toast.error("Bulk delete failed: " + (err as Error).message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = () => {
    const toExport = selected.size > 0
      ? filtered.filter((l) => selected.has(l.id))
      : filtered;
    if (toExport.length === 0) { toast.error("No leads to export"); return; }
    exportLeadsToCSV(toExport);
    toast.success(`Exported ${toExport.length} lead${toExport.length > 1 ? "s" : ""} to CSV`);
  };

  return (
    <DashboardLayout title="Leads">
      <div className="p-5 space-y-4 max-w-5xl">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3">
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

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground">
              {selected.size > 0 ? `${selected.size} selected · ` : ""}
              {filtered.length} of {leads.length}
            </span>
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              {selected.size > 0 ? `Export ${selected.size}` : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Bulk action toolbar — appears when items are selected */}
        {someSelected && (
          <div className="flex flex-wrap items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 animate-slide-up">
            <div className="flex items-center gap-2 mr-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span className="text-[13px] font-semibold text-foreground">
                {selected.size} selected
              </span>
            </div>

            <span className="text-[12px] text-muted-foreground mr-1">Change status:</span>
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleBulkStatus(s)}
                disabled={bulkLoading}
                className={`${statusClasses[s]} cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40`}
              >
                {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                {statusLabels[s]}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/15 text-[12px] font-medium transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

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
                  ? "Leads appear when customers request a human agent via WhatsApp."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {/* Select-all checkbox */}
                    <th className="w-10 px-4 py-3">
                      <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground transition-colors">
                        {allSelected
                          ? <CheckSquare className="w-4 h-4 text-primary" />
                          : someSelected
                            ? <RefreshCw className="w-4 h-4" />
                            : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    {["Customer", "Phone", "Status", "Created"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const isSelected = selected.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => toggleOne(lead.id)}
                        className={`border-b border-border last:border-0 transition-colors cursor-pointer ${
                          isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                        }`}
                      >
                        {/* Row checkbox */}
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleOne(lead.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                            {isSelected
                              ? <CheckSquare className="w-4 h-4 text-primary" />
                              : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                            }`}>
                              {(lead.customer_name || lead.phone_number)[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-[13px] text-foreground">
                              {lead.customer_name || lead.phone_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {lead.phone_number}
                          </div>
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-flex items-center">
                            <select
                              value={lead.status}
                              onChange={(e) => updateStatus.mutate({ id: lead.id, status: e.target.value })}
                              className={`${statusClasses[lead.status]} appearance-none cursor-pointer pr-5 border-0 outline-none font-medium`}
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s}>{statusLabels[s]}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground tabular">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.created_at).toLocaleDateString(undefined, {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
