import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  ArrowLeftRight,
  ListTodo,
  BarChart3,
  Receipt,
  Settings,
  Building2,
  Phone,
} from "lucide-react";
import { type UserRole } from "@/contexts/RoleContext";

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["consultant", "manager", "client", "admin"] },
  { label: "Clients", path: "/clients", icon: Users, roles: ["consultant", "manager", "admin"] },
  { label: "Suppliers", path: "/suppliers", icon: Building2, roles: ["consultant", "manager", "admin"] },
  { label: "Customs Data", path: "/customs-data", icon: Upload, roles: ["consultant", "manager", "admin"] },
  { label: "CADs", path: "/cads", icon: FileText, roles: ["consultant", "manager", "client", "admin"] },
  { label: "Adjustments", path: "/adjustments", icon: ArrowLeftRight, roles: ["consultant", "manager", "client", "admin"] },
  { label: "Interactions", path: "/interactions", icon: Phone, roles: ["consultant", "manager", "client", "admin"] },
  { label: "Tasks", path: "/tasks", icon: ListTodo, roles: ["consultant", "manager", "admin"] },
  { label: "Reports", path: "/reports", icon: BarChart3, roles: ["manager", "admin"] },
  { label: "Billing", path: "/billing", icon: Receipt, roles: ["manager", "admin"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["admin"] },
];
