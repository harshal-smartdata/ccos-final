import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
}: MetricCardProps) => {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn("p-2 rounded-lg bg-secondary", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {change && (
        <p
          className={cn(
            "text-xs mt-2 font-medium",
            changeType === "positive" && "text-emerald-600",
            changeType === "negative" && "text-red-600",
            changeType === "neutral" && "text-muted-foreground"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
};
