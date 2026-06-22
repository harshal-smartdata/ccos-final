import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Download } from "lucide-react";

const clients = [
  { id: "1", name: "Toronto Tech Solutions (TTS-001)", code: "MTC-001", status: "Active", statusV: "success" as const, cads: 12, contact: "John Smith", lastActivity: "2 hours ago" },
  { id: "2", name: "Vancouver Logistics Ltd. (VLL-002)", code: "NIL-002", status: "Active", statusV: "success" as const, cads: 8, contact: "Jane Doe", lastActivity: "1 day ago" },
  { id: "3", name: "Montreal Wholesale Inc. (MWI-003)", code: "PCI-003", status: "Active", statusV: "success" as const, cads: 15, contact: "Bob Wilson", lastActivity: "3 days ago" },
  { id: "4", name: "Atlantic Freight", code: "AFR-004", status: "Pending", statusV: "warning" as const, cads: 3, contact: "Alice Brown", lastActivity: "1 week ago" },
  { id: "5", name: "West Coast Logistics", code: "WCL-005", status: "Inactive", statusV: "neutral" as const, cads: 0, contact: "Tom Lee", lastActivity: "2 months ago" },
];

const ClientsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client portfolio and linked customs data."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => navigate("/clients/new")}>
              <Plus className="h-4 w-4 mr-1" /> Add Client
            </Button>
          </>
        }
      />

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" /> Filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Code</th>
              <th>Status</th>
              <th>CADs</th>
              <th>Contact</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="cursor-pointer" onClick={() => navigate(`/clients/${client.id}`)}>
                <td className="font-medium">{client.name}</td>
                <td className="text-muted-foreground font-mono text-xs">{client.code}</td>
                <td><StatusBadge label={client.status} variant={client.statusV} /></td>
                <td>{client.cads}</td>
                <td>{client.contact}</td>
                <td className="text-muted-foreground">{client.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsPage;
