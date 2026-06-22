import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { useNavigation } from "@/contexts/NavigationContext";

import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  ClipboardCheck,
  ArrowLeftRight,
  ListTodo,
  BarChart3,
  Receipt,
  Settings,
  ChevronLeft,
  Building2,
  ShieldCheck,
  MessageSquare,
  Phone,
} from "lucide-react";

import { navItems, type NavItem } from "@/config/navigation";
import ccosLogo from "@/assets/CCOS_Logo.png";

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useRole();
  const { isItemVisible } = useNavigation();
  const location = useLocation();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(role) && isItemVisible(item.label)
  );


  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 h-screen sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border overflow-hidden">
        <div className={cn(
          "flex items-center shrink-0 transition-all duration-200",
          collapsed ? "w-8 h-8 mx-auto" : "w-full space-x-2"
        )}>
          <img
            src={ccosLogo}
            alt="CCOS Logo"
            className={cn(
              "object-contain transition-all duration-200",
              collapsed ? "w-8 h-8" : "h-10 w-auto max-w-[200px]"
            )}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
};
