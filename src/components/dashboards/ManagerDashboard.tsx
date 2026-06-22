import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Users, TrendingUp, AlertTriangle, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", submitted: 45, approved: 38 },
  { month: "Feb", submitted: 52, approved: 47 },
  { month: "Mar", submitted: 61, approved: 55 },
  { month: "Apr", submitted: 48, approved: 42 },
];

const teamPerformance = [
  { name: "Consultant 1", submitted: 18, pending: 3, accuracy: "96%" },
  { name: "Consultant 2", submitted: 14, pending: 5, accuracy: "92%" },
  { name: "Consultant 3", submitted: 16, pending: 2, accuracy: "98%" },
];

const riskAlerts = [
  { message: "SIMA flag on steel imports — Client 4", severity: "danger" as const },
  { message: "Surtax alert: China origin goods — Atlantic Freight", severity: "warning" as const },
  { message: "Expired HS classification — Northern Imports", severity: "warning" as const },
];

export const ManagerDashboard = () => {
  return (
    <div>
      <PageHeader title="Compliance Overview" description="Team performance and submission analytics." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Submissions" value={166} change="+12% vs last month" changeType="positive" icon={TrendingUp} />
        <MetricCard title="Active Consultants" value={8} icon={Users} />
        <MetricCard title="Risk Alerts" value={3} change="Action required" changeType="negative" icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Revenue MTD" value="$48.2K" change="+8% vs target" changeType="positive" icon={DollarSign} iconColor="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-5">
          <h2 className="text-sm font-semibold mb-4">Submission Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215 14% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 14% 46%)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(214 20% 90%)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="submitted" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Risk Alerts</h2>
          </div>
          <div className="divide-y">
            {riskAlerts.map((alert, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === "danger" ? "text-destructive" : "text-warning"}`} />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="mt-6 bg-card rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold">Team Performance</h2>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Full report <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Consultant</th>
              <th>Submitted</th>
              <th>Pending</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {teamPerformance.map((p) => (
              <tr key={p.name}>
                <td className="font-medium">{p.name}</td>
                <td>{p.submitted}</td>
                <td>{p.pending}</td>
                <td><StatusBadge label={p.accuracy} variant="success" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
