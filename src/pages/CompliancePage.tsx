import { PageHeader } from "@/components/shared/PageHeader";
import { ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const complianceItems = [
  { rule: "SIMA Duty Assessment", description: "Anti-dumping duties on steel products from China", status: "Active Alert", statusV: "danger" as const, affected: 4 },
  { rule: "Country Surtax", description: "Additional tariffs on goods originating from specified countries", status: "Monitoring", statusV: "warning" as const, affected: 2 },
  { rule: "HS Code Accuracy", description: "Classification accuracy across all active CADs", status: "98.2% Compliant", statusV: "success" as const, affected: 0 },
  { rule: "4-Year Rule Check", description: "B2 adjustments within the 4-year eligibility window", status: "All Clear", statusV: "success" as const, affected: 0 },
];

const CompliancePage = () => {
  return (
    <div>
      <PageHeader title="Compliance Monitor" description="Track regulatory compliance and risk alerts." />

      <div className="space-y-4">
        {complianceItems.map((item, i) => (
          <div key={i} className="bg-card rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold">{item.rule}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.affected > 0 && (
                  <span className="text-xs text-muted-foreground">{item.affected} CADs affected</span>
                )}
                <StatusBadge label={item.status} variant={item.statusV} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompliancePage;
