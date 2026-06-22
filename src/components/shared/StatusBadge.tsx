import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "status-badge-success",
  warning: "status-badge-warning",
  danger: "status-badge-danger",
  info: "status-badge-info",
  neutral: "status-badge-neutral",
};

export const StatusBadge = ({ label, variant }: StatusBadgeProps) => {
  return <span className={cn(variantClasses[variant])}>{label}</span>;
};
