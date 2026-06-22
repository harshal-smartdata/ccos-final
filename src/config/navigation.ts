import {
  Settings,
  UserCog,
  Building2,
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
  { label: "User Management", path: "/user-management", icon: UserCog, roles: ["admin"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["admin"] },
];
