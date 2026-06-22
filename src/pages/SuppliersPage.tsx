import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";

const suppliers = [
  { id: "1", name: "Supplier 1", country: "China", status: "Active", statusV: "success" as const, clients: 3, cads: 18, lastShipment: "Apr 12, 2026" },
  { id: "2", name: "Supplier 2", country: "Japan", status: "Active", statusV: "success" as const, clients: 2, cads: 9, lastShipment: "Apr 10, 2026" },
  { id: "3", name: "Supplier 3", country: "Vietnam", status: "Active", statusV: "success" as const, clients: 4, cads: 22, lastShipment: "Apr 8, 2026" },
  { id: "4", name: "Supplier 4", country: "Germany", status: "Under Review", statusV: "warning" as const, clients: 1, cads: 5, lastShipment: "Mar 28, 2026" },
  { id: "5", name: "Supplier 5", country: "India", status: "Inactive", statusV: "neutral" as const, clients: 1, cads: 2, lastShipment: "Jan 15, 2026" },
];

const SuppliersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Manage supplier records linked to customs data and CADs."
        actions={
          <Button size="sm" onClick={() => navigate("/suppliers/new")}>
            <Plus className="h-4 w-4 mr-1" /> Add Supplier
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-1.5 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" /> Filters
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Country</th>
              <th>Status</th>
              <th>Linked Clients</th>
              <th>CADs</th>
              <th>Last Shipment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="cursor-pointer" onClick={() => navigate(`/suppliers/${s.id}`)}>
                <td className="font-medium">{s.name}</td>
                <td>{s.country}</td>
                <td><StatusBadge label={s.status} variant={s.statusV} /></td>
                <td>{s.clients}</td>
                <td>{s.cads}</td>
                <td className="text-muted-foreground">{s.lastShipment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuppliersPage;
