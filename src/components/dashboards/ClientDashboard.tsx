import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { FileText, DollarSign, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const cases = [
  { id: "CAD-2024-0891", type: "B3 Entry", status: "In Progress", statusV: "info" as const, updated: "2 hours ago" },
  { id: "ADJ-2024-0234", type: "B2 Adjustment", status: "Pending Review", statusV: "warning" as const, updated: "1 day ago" },
  { id: "CAD-2024-0876", type: "B3 Entry", status: "Completed", statusV: "success" as const, updated: "3 days ago" },
];

const timeline = [
  { text: "CAD-2024-0891 validation completed", time: "2 hours ago" },
  { text: "New invoice #INV-0456 generated", time: "Yesterday" },
  { text: "B2 Adjustment ADJ-0234 submitted for review", time: "2 days ago" },
  { text: "Refund of $3,240 approved", time: "3 days ago" },
];

export const ClientDashboard = () => {
  return (
    <div>
      <PageHeader
        title="Welcome back,"
        description="Track your customs filings and requests."
        actions={
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Active Cases" value={3} icon={FileText} />
        <MetricCard title="Pending Refunds" value="$8,420" icon={DollarSign} iconColor="text-success" />
        <MetricCard title="Open Requests" value={2} icon={Clock} />
        <MetricCard title="This Month Billing" value="$2,150" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Active Cases</h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Case ID</th><th>Type</th><th>Status</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="cursor-pointer">
                  <td className="font-medium text-primary">{c.id}</td>
                  <td>{c.type}</td>
                  <td><StatusBadge label={c.status} variant={c.statusV} /></td>
                  <td className="text-muted-foreground">{c.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Activity Timeline</h2>
          </div>
          <div className="px-5 py-3 space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  {i < timeline.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
