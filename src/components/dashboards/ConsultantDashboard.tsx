import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const recentCADs = [
  { id: "CAD-2024-0891", client: "Client 4 (C4-004)", status: "Pending Review", statusV: "warning" as const, date: "Apr 14, 2026" },
  { id: "CAD-2024-0890", client: "Northern Imports Ltd.", status: "Submitted", statusV: "info" as const, date: "Apr 13, 2026" },
  { id: "CAD-2024-0889", client: "Pacific Customs Inc.", status: "Approved", statusV: "success" as const, date: "Apr 12, 2026" },
  { id: "CAD-2024-0888", client: "Atlantic Freight", status: "Error", statusV: "danger" as const, date: "Apr 12, 2026" },
  { id: "CAD-2024-0887", client: "West Coast Logistics", status: "Draft", statusV: "neutral" as const, date: "Apr 11, 2026" },
];

const tasks = [
  { title: "Validate HS codes for Client 2 shipment", priority: "High", due: "Today" },
  { title: "Complete B2 adjustment for Northern Imports", priority: "High", due: "Today" },
  { title: "Review duty calculation — Pacific Customs", priority: "Medium", due: "Tomorrow" },
  { title: "Upload customs data for Atlantic Freight", priority: "Low", due: "Apr 18" },
];

export const ConsultantDashboard = () => {
  return (
    <div>
      <PageHeader
        title="Good morning"
        description="Here's your compliance overview for today."
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Active CADs" value={24} change="+3 this week" changeType="positive" icon={FileText} />
        <MetricCard title="Pending Tasks" value={8} change="2 overdue" changeType="negative" icon={Clock} />
        <MetricCard title="Compliance Flags" value={3} change="Down from 7" changeType="positive" icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Declarations Submitted" value={5} change="+2 vs yesterday" changeType="positive" icon={CheckCircle2} iconColor="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-1 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">My Tasks</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="divide-y">
            {tasks.map((task, i) => (
              <div key={i} className="px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                <p className="text-sm font-medium leading-snug">{task.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <StatusBadge
                    label={task.priority}
                    variant={task.priority === "High" ? "danger" : task.priority === "Medium" ? "warning" : "neutral"}
                  />
                  <span className="text-xs text-muted-foreground">{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent CADs */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Recent CADs</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>CAD ID</th>
                <th>Client</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentCADs.map((cad) => (
                <tr key={cad.id} className="cursor-pointer">
                  <td className="font-medium text-primary">{cad.id}</td>
                  <td>{cad.client}</td>
                  <td><StatusBadge label={cad.status} variant={cad.statusV} /></td>
                  <td className="text-muted-foreground">{cad.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
