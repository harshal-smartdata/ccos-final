import {
  Settings,
  UserCog,
  Building2,
  FileText,
  UserCheck,
  SlidersHorizontal,
} from "lucide-react";
import { type UserRole } from "@/contexts/RoleContext";

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { label: "Client Profiles", path: "/client-profiles", icon: Building2, roles: ["admin", "manager", "consultant"] },
  { label: "Agreements", path: "/agreements", icon: FileText, roles: ["admin", "manager", "consultant"] },
  { label: "Client Onboarding", path: "/client-onboarding", icon: UserCheck, roles: ["admin", "manager", "consultant"] },
  { label: "Masters", path: "/masters", icon: SlidersHorizontal, roles: ["admin"] },
  { label: "User Management", path: "/user-management", icon: UserCog, roles: ["admin"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["admin"] },
];
