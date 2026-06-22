import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Server, Users, AlertCircle, Activity } from "lucide-react";

const apiLogs = [
  { endpoint: "CARM /submitCAD", status: 200, time: "142ms", timestamp: "14:23:01" },
  { endpoint: "CARM /validateHS", status: 200, time: "89ms", timestamp: "14:22:58" },
  { endpoint: "CARM /getStatus", status: 500, time: "2301ms", timestamp: "14:22:45" },
  { endpoint: "CARM /submitCAD", status: 200, time: "156ms", timestamp: "14:22:30" },
  { endpoint: "CARM /auth/token", status: 200, time: "67ms", timestamp: "14:22:15" },
];

const configAlerts = [
  { message: "CARM OAuth token expires in 3 days", severity: "warning" as const },
  { message: "Database backup completed successfully", severity: "success" as const },
  { message: "Rate limit threshold at 82%", severity: "warning" as const },
];

export const AdminDashboard = () => {
  return (
    <div>
      <PageHeader title="System Administration" description="Monitor system health and configuration." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="System Uptime" value="99.97%" change="Last 30 days" changeType="positive" icon={Server} />
        <MetricCard title="Active Users" value={42} change="12 online now" changeType="neutral" icon={Users} />
        <MetricCard title="API Errors (24h)" value={3} change="Down from 8" changeType="positive" icon={AlertCircle} iconColor="text-destructive" />
        <MetricCard title="API Calls (24h)" value="2,847" change="+15% vs avg" changeType="neutral" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Logs */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Recent API Logs</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Endpoint</th><th>Status</th><th>Time</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {apiLogs.map((log, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs">{log.endpoint}</td>
                  <td>
                    <StatusBadge
                      label={String(log.status)}
                      variant={log.status === 200 ? "success" : "danger"}
                    />
                  </td>
                  <td className="text-muted-foreground">{log.time}</td>
                  <td className="text-muted-foreground font-mono text-xs">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Config Alerts */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Configuration Alerts</h2>
          </div>
          <div className="divide-y">
            {configAlerts.map((alert, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <StatusBadge label={alert.severity === "warning" ? "Warning" : "OK"} variant={alert.severity} />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
