import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const discrepancies = [
  { id: "CAD-2024-0876", client: "Montreal Wholesale Inc. (MWI-003)", presentPaid: 12500.00, actualValue: 10240.00, diff: -2260.00, status: "Adjustment Required", statusV: "warning" as const, date: "Apr 13, 2026" },
  { id: "CAD-2024-0865", client: "Toronto Tech Solutions (TTS-001)", presentPaid: 4500.00, actualValue: 4120.00, diff: -380.00, status: "Draft Saved", statusV: "neutral" as const, date: "Apr 10, 2026" },
  { id: "CAD-2024-0850", client: "Vancouver Logistics Ltd. (VLL-002)", presentPaid: 8900.00, actualValue: 10790.00, diff: 1890.00, status: "Audit Action Needed", statusV: "danger" as const, date: "Apr 8, 2026" },
  { id: "CAD-2024-0842", client: "Atlantic Freight", presentPaid: 15600.00, actualValue: 15600.00, diff: 0.00, status: "No Correction Needed", statusV: "success" as const, date: "Apr 5, 2026" },
];

const AdjustmentsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = discrepancies.filter((d) =>
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="CAD Adjustments"
        description="Review and adjust declarations with valuation or classification discrepancies."
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search adjustments..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>CAD Reference</th>
              <th>Client</th>
              <th>Present Paid</th>
              <th>Actual Value</th>
              <th>Difference</th>
              <th className="!text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {discrepancies.map((d) => (
              <tr key={d.id}>
                <td className="font-medium text-primary">{d.id}</td>
                <td className="text-sm">{d.client}</td>
                <td className="text-sm font-mono">${d.presentPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className="text-sm font-mono">${d.actualValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td className={`text-sm font-bold ${d.diff < 0 ? 'text-emerald-600' : d.diff > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {d.diff > 0 ? '+' : ''}{d.diff.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/cad/${d.id}/adjust`)} className="text-primary hover:text-primary hover:bg-primary/10 font-bold">
                    Adjust CAD
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdjustmentsPage;
