import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Users, Settings, FileText, Activity, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { navItems } from "@/config/navigation";
import { Switch } from "@/components/ui/switch";


const tabs = ["Users", "Navigation", "Audit Trail", "Logs"];


const users = [
  { name: "Sarah Chen", email: "sarah@ccos.ca", role: "Consultant", status: "Active", statusV: "success" as const, lastLogin: "10 min ago" },
  { name: "James Wilson", email: "james@ccos.ca", role: "Manager", status: "Active", statusV: "success" as const, lastLogin: "1 hour ago" },
  { name: "Lisa Park", email: "lisa@ccos.ca", role: "Consultant", status: "Active", statusV: "success" as const, lastLogin: "3 hours ago" },
  { name: "Admin User", email: "admin@ccos.ca", role: "Administrator", status: "Active", statusV: "success" as const, lastLogin: "Just now" },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("Users");
  const { isItemVisible, toggleItemVisibility } = useNavigation();


  return (
    <div>
      <PageHeader title="System Settings" description="Configure system-wide preferences, manage users, and view audit logs." />

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Users" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">User Management</h2>
            <Button size="sm">Add User</Button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="cursor-pointer">
                  <td className="font-medium">{u.name}</td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td><StatusBadge label={u.role} variant="info" /></td>
                  <td><StatusBadge label={u.status} variant={u.statusV} /></td>
                  <td className="text-muted-foreground">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === "Navigation" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-sm font-semibold">Navigation Management</h2>
            <p className="text-xs text-muted-foreground mt-1">Control which items appear in the sidebar navigation.</p>
          </div>
          <div className="p-5 space-y-4">
            {navItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-background border">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isItemVisible(item.label) ? (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <Eye className="h-3.5 w-3.5" /> Visible
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <EyeOff className="h-3.5 w-3.5" /> Hidden
                    </span>
                  )}
                  <Switch 
                    checked={isItemVisible(item.label)} 
                    onCheckedChange={() => toggleItemVisibility(item.label)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Audit Trail" && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4">Audit Trail</h2>
          <p className="text-sm text-muted-foreground">Full audit trail explorer with date filters and user search coming soon.</p>
        </div>
      )}

      {activeTab === "Logs" && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4">System Logs</h2>
          <p className="text-sm text-muted-foreground">Real-time log viewer with severity filtering coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
