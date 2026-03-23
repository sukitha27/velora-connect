import type { Lead } from "@/lib/api";

export function exportLeadsToCSV(leads: Lead[]) {
  const headers = ["Name", "Phone", "Status", "Created At"];

  const rows = leads.map((lead) => [
    lead.customer_name || "",
    lead.phone_number,
    lead.status.replace("_", " "),
    new Date(lead.created_at).toLocaleString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma/newline
          const str = String(cell).replace(/"/g, '""');
          return /[,"\n\r]/.test(str) ? `"${str}"` : str;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `velora-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
