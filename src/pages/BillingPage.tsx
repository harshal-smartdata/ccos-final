import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MetricCard } from "@/components/shared/MetricCard";
import { DollarSign, FileText, CreditCard, TrendingUp } from "lucide-react";

const invoices = [
  { id: "INV-0456", client: "Toronto Tech Solutions (TTS-001)", amount: 2150, status: "Paid", statusV: "success" as const, date: "Apr 14, 2026" },
  { id: "INV-0455", client: "Vancouver Logistics Ltd. (VLL-002)", amount: 1340, status: "Pending", statusV: "warning" as const, date: "Apr 10, 2026" },
  { id: "INV-0454", client: "Montreal Wholesale Inc. (MWI-003)", amount: 3890, status: "Paid", statusV: "success" as const, date: "Apr 5, 2026" },
  { id: "INV-0453", client: "Atlantic Freight", amount: 780, status: "Overdue", statusV: "danger" as const, date: "Mar 28, 2026" },
  { id: "INV-0452", client: "Toronto Tech Solutions (TTS-001)", amount: 1200, status: "Pending", statusV: "warning" as const, date: "Mar 25, 2026" },
];

const BillingPage = () => {
  const aggregatedData = invoices.reduce((acc, inv) => {
    if (!acc[inv.client]) {
      acc[inv.client] = {
        name: inv.client,
        totalInvoiced: 0,
        outstanding: 0,
        lastInvoice: inv.date,
        status: inv.status,
        statusV: inv.statusV,
        invoiceCount: 0
      };
    }
    const client = acc[inv.client];
    client.totalInvoiced += inv.amount;
    if (inv.status !== "Paid") {
      client.outstanding += inv.amount;
    }
    client.invoiceCount += 1;
    // Simple logic to pick the most "urgent" status or the latest one
    if (inv.status === "Overdue") {
      client.status = "Overdue";
      client.statusV = "danger";
    } else if (inv.status === "Pending" && client.status !== "Overdue") {
      client.status = "Pending";
      client.statusV = "warning";
    }
    return acc;
  }, {} as Record<string, any>);

  const clientsList = Object.values(aggregatedData);
  const totalRevenue = clientsList.reduce((sum, c) => sum + c.totalInvoiced, 0);
  const totalOutstanding = clientsList.reduce((sum, c) => sum + c.outstanding, 0);

  return (
    <div>
      <PageHeader title="Billing & Revenue" description="Monitor client billing status and revenue performance." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}K`} change="+12% vs last month" changeType="positive" icon={DollarSign} iconColor="text-success" />
        <MetricCard title="Total Outstanding" value={`$${(totalOutstanding / 1000).toFixed(1)}K`} icon={CreditCard} changeType={totalOutstanding > 5000 ? "negative" : "neutral"} />
        <MetricCard title="Active Clients" value={clientsList.length} icon={FileText} />
        <MetricCard title="Collection Rate" value="92%" changeType="negative" change="-2% vs last month" icon={TrendingUp} />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold">Client Billing Summary</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Total Invoiced</th>
              <th>Outstanding</th>
              <th>Invoices</th>
              <th>Last Activity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clientsList.map((client) => (
              <tr key={client.name} className="cursor-pointer">
                <td className="font-medium">{client.name}</td>
                <td className="font-medium">${client.totalInvoiced.toLocaleString()}</td>
                <td className={client.outstanding > 0 ? "text-danger font-medium" : "text-muted-foreground"}>
                  ${client.outstanding.toLocaleString()}
                </td>
                <td>{client.invoiceCount}</td>
                <td className="text-muted-foreground">{client.lastInvoice}</td>
                <td><StatusBadge label={client.status} variant={client.statusV} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingPage;
