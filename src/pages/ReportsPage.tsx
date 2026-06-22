import { PageHeader } from "@/components/shared/PageHeader";
import { 
  Users, Clock, ShieldAlert, CreditCard, 
  BarChartHorizontal, Briefcase, Activity, ArrowUpRight
} from "lucide-react";

const reportModules = [
  { title: "Client-wise CAD Summary", desc: "Detailed breakdown of CAD filings and duties per client profile.", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Adjustment Performance", desc: "Average processing time and approval rates across adjustment types.", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
  { title: "Refund Recovery Report", desc: "Analysis of recovered duties vs. identified saving opportunities.", icon: ArrowUpRight, color: "text-success", bg: "bg-green-50" },
  { title: "Aging Report", desc: "Status tracking for documents based on time elapsed since creation.", icon: Clock, color: "text-warning", bg: "bg-amber-50" },
  { title: "Financial Exposure", desc: "Predicted duty liabilities and risk assessments for upcoming filings.", icon: ShieldAlert, color: "text-danger", bg: "bg-red-50" },
  { title: "Billing & Revenue Dashboard", desc: "Comprehensive view of invoicing, payments, and client collections.", icon: CreditCard, color: "text-primary", bg: "bg-slate-50" },
  { title: "Consultant Productivity", desc: "Filing efficiency and throughput metrics per assigned consultant.", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50" },
];

const ReportsPage = () => {
  return (
    <div className="pb-10">
      <PageHeader title="Reports & Analytics" description="Access specialized operational, compliance, and financial summaries." />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 px-1">Specialized Report Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportModules.map((m) => (
            <div key={m.title} className="bg-card hover:bg-accent/50 transition-colors rounded-xl border shadow-sm p-6 cursor-pointer group">
              <div className="flex items-start gap-5">
                <div className={`p-3 rounded-lg ${m.bg}`}>
                  <m.icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{m.title}</h3>
                    <BarChartHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
