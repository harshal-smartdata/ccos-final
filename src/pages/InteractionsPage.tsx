import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Phone, Mail, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data
const mockInteractions = [
  { id: "1", date: "2026-04-10", type: "Email", client: "Toronto Tech Solutions (TTS-001)", transaction: "CAD-999021", notes: "Followed up regarding missing commercial invoice.", consultant: "Sarah Chen" },
  { id: "2", date: "2026-04-12", type: "Phone Call", client: "Global Imports Ltd", transaction: "CAD-10332", notes: "Client clarified routing details for upcoming shipment.", consultant: "Sarah Chen" },
];

export default function InteractionsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = mockInteractions.filter(i => 
    i.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.transaction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interactions</h1>
          <p className="text-muted-foreground">Log and track customer communications and CAD follow-ups.</p>
        </div>
        <Button onClick={() => navigate("/interactions/new")}>
          <Plus className="mr-2 h-4 w-4" /> Log Interaction
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/20 flex-shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by client or transaction..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-background border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Related Transaction</th>
                <th className="px-5 py-3 font-medium">Notes</th>
                <th className="px-5 py-3 font-medium">Consultant</th>
                <th className="px-5 py-3 font-medium !text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t border-border">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap">{item.date}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">
                      {item.type === "Email" ? <Mail className="h-3 w-3 text-emerald-600" /> : item.type === "Phone Call" ? <Phone className="h-3 w-3 text-blue-600" /> : <UsersIcon className="h-3 w-3 text-purple-600" />}
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">{item.client}</td>
                  <td className="px-5 py-3">
                    {item.transaction ? <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">{item.transaction}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-3 max-w-sm truncate" title={item.notes}>{item.notes}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{item.consultant}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => navigate(`/interactions/${item.id}/edit`)} className="text-primary hover:underline font-medium text-xs">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">No interactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
