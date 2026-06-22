import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Download } from "lucide-react";

const cads = [
  { id: "CAD-2024-0891", client: "Toronto Tech Solutions (TTS-001)", supplier: "Shanghai Metals Ltd.", hsCode: "7208.51", status: "Pending Review", statusV: "warning" as const, duty: "$4,230", date: "Apr 14, 2026" },
  { id: "CAD-2024-0890", client: "Vancouver Logistics Ltd. (VLL-002)", supplier: "Tokyo Parts Co.", hsCode: "8708.29", status: "Submitted", statusV: "info" as const, duty: "$1,890", date: "Apr 13, 2026" },
  { id: "CAD-2024-0889", client: "Montreal Wholesale Inc. (MWI-003)", supplier: "Vietnam Textiles", hsCode: "6204.62", status: "Approved", statusV: "success" as const, duty: "$2,150", date: "Apr 12, 2026" },
  { id: "CAD-2024-0888", client: "Atlantic Freight", supplier: "EU Steel GmbH", hsCode: "7306.30", status: "Validation Error", statusV: "danger" as const, duty: "$6,780", date: "Apr 12, 2026" },
  { id: "CAD-2024-0887", client: "West Coast Logistics", supplier: "India Pharma Ltd.", hsCode: "3004.90", status: "Draft", statusV: "neutral" as const, duty: "$890", date: "Apr 11, 2026" },
  { id: "CAD-2024-0886", client: "Toronto Tech Solutions (TTS-001)", supplier: "Korea Electronics", hsCode: "8542.31", status: "Approved", statusV: "success" as const, duty: "$3,450", date: "Apr 10, 2026" },
];

const CADsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = cads.filter((c) => {
    const matchesSearch = c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status.toLowerCase().includes(statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="CAD Management"
        description="Create, validate, and submit Customs Accounting Documents."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => navigate("/cads/new")}>
              <Plus className="h-4 w-4 mr-1" /> New CAD
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search CADs, clients, suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1">
          {["all", "draft", "pending", "submitted", "approved", "error"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>CAD ID</th>
              <th>Client</th>
              <th>Supplier</th>
              <th>HS Code</th>
              <th>Status</th>
              <th>Duty</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cad) => (
              <tr key={cad.id} className="cursor-pointer" onClick={() => navigate(`/cads/${cad.id}`)}>
                <td className="font-medium text-primary">{cad.id}</td>
                <td>{cad.client}</td>
                <td>{cad.supplier}</td>
                <td className="font-mono text-xs">{cad.hsCode}</td>
                <td><StatusBadge label={cad.status} variant={cad.statusV} /></td>
                <td className="font-medium">{cad.duty}</td>
                <td className="text-muted-foreground">{cad.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CADsPage;
