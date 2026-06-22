import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, ArrowLeft, Search, ChevronLeft, ChevronRight, Settings2, Menu, ScrollText, FileText, ChevronRight as ChevronRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RowActions } from "@/components/user-management/ListShell";
import { useUserManagement, getRoleModules } from "@/contexts/UserManagementContext";
import { navItems } from "@/config/navigation";


type Section = "navigation" | "audit" | "logs";
const SECTION_CARDS: { id: Section; title: string; description: string; icon: typeof Menu; accent: string }[] = [
  { id: "navigation", title: "Navigation", description: "Control which menu items each role can see.", icon: Menu, accent: "bg-primary/10 text-primary" },
  { id: "audit", title: "Audit Trail", description: "Review who changed what and when.", icon: ScrollText, accent: "bg-primary/10 text-primary" },
  { id: "logs", title: "Logs", description: "Inspect system events and errors.", icon: FileText, accent: "bg-primary/10 text-primary" },
];
const SECTION_TITLES: Record<Section, string> = { navigation: "Navigation", audit: "Audit Trail", logs: "Logs" };
const ROLES_PER_PAGE = 10;
// Dashboard is always available, so it isn't a configurable navigation item.
const NAV_OPTIONS = navItems.filter((n) => n.label !== "Dashboard");


const AdminPage = () => {
  const [section, setSection] = useState<Section | null>(null);
  const { roles, setRoleModuleAccess } = useUserManagement();
  const navigate = useNavigate();

  // Navigation master/detail: list of nav items → per-item role visibility.
  const [detailNav, setDetailNav] = useState<string | null>(null);
  const [navSearch, setNavSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredNav = useMemo(
    () => NAV_OPTIONS.filter((n) => n.label.toLowerCase().includes(navSearch.toLowerCase())),
    [navSearch]
  );
  const rolesWithAccess = (label: string) => roles.filter((r) => getRoleModules(r).includes(label)).length;

  const filteredRoles = useMemo(
    () => roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [roles, search]
  );
  const pageCount = Math.ceil(filteredRoles.length / ROLES_PER_PAGE);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const pagedRoles = filteredRoles.slice((safePage - 1) * ROLES_PER_PAGE, safePage * ROLES_PER_PAGE);

  const openDetail = (label: string) => {
    setDetailNav(label);
    setSearch("");
    setPage(1);
  };


  return (
    <div className="w-full pb-8">
      {/* Card hub */}
      {section === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {SECTION_CARDS.map((card) => {
            return (
              <button
                key={card.id}
                onClick={() => setSection(card.id)}
                className="group bg-card rounded-xl border border-b-4 border-b-primary shadow-sm p-4 min-h-[110px] flex items-center justify-center hover:shadow-md transition-all"
              >
                <h3 className="text-base font-semibold text-center">{card.title}</h3>
              </button>
            );
          })}
        </div>
      )}

      {/* Section header (back to hub) — hidden in Navigation detail, which has its own breadcrumb */}
      {section !== null && !(section === "navigation" && detailNav !== null) && (
        <div className="flex items-center gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={() => { setSection(null); setDetailNav(null); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-lg font-semibold">{SECTION_TITLES[section]}</h2>
        </div>
      )}

      {section === "navigation" && detailNav === null && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b">
            <div>
              <h2 className="text-sm font-semibold">Navigation Items</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Each menu item in the sidebar. Open one to choose which roles can see it.
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate("/user-management")}>
              Manage Roles <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Search nav items */}
          <div className="px-5 py-3 border-b">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-background border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Search navigation items..."
              />
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th className="w-28">Menu Order</th>
                <th>Title</th>
                <th>Visible To</th>
                <th className="!text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredNav.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted-foreground py-8 text-center">No navigation items found.</td>
                </tr>
              ) : (
                filteredNav.map((item) => {
                  const count = rolesWithAccess(item.label);
                  const order = NAV_OPTIONS.findIndex((n) => n.label === item.label) + 1;
                  return (
                    <tr key={item.label} className="cursor-pointer" onClick={() => openDetail(item.label)}>
                      <td className="text-muted-foreground">{order}</td>
                      <td>
                        <div className="flex items-center gap-2 font-medium">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </div>
                      </td>
                      <td>
                        <StatusBadge
                          label={count === 0 ? "Hidden from all" : `${count} of ${roles.length} role${roles.length === 1 ? "" : "s"}`}
                          variant={count === 0 ? "neutral" : "success"}
                        />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center">
                          <RowActions
                            actions={[
                              {
                                label: "Manage Role Visibility",
                                icon: <Settings2 className="h-4 w-4" />,
                                onClick: () => openDetail(item.label),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {section === "navigation" && detailNav !== null && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={() => setDetailNav(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <nav className="flex items-center text-sm">
              <span className="text-muted-foreground">Navigation</span>
              <span className="mx-1.5 text-muted-foreground">/</span>
              <span className="font-semibold">{detailNav}</span>
            </nav>
          </div>

          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-semibold">Role Visibility — {detailNav}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Show or hide "{detailNav}" per role. Showing grants Read access — set detailed permissions in User Management → Roles.
              </p>
            </div>

            {/* Search roles + pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-background border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Search roles..."
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                <span className="mr-1">{filteredRoles.length} role{filteredRoles.length === 1 ? "" : "s"}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="whitespace-nowrap">Page {pageCount === 0 ? 0 : safePage} of {pageCount}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="!text-center">Show / Hide</th>
                </tr>
              </thead>
              <tbody>
                {pagedRoles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground py-8 text-center">
                      {roles.length === 0 ? "No roles defined yet." : "No roles match your search."}
                    </td>
                  </tr>
                ) : (
                  pagedRoles.map((r) => {
                    const shown = getRoleModules(r).includes(detailNav);
                    return (
                      <tr key={r.id}>
                        <td className="font-medium">{r.name}</td>
                        <td>
                          <StatusBadge label={shown ? "Shown" : "Hidden"} variant={shown ? "success" : "neutral"} />
                        </td>
                        <td>
                          <div className="flex justify-center">
                            <Switch
                              checked={shown}
                              onCheckedChange={(v) => setRoleModuleAccess(r.id, detailNav, v === true)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === "audit" && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4">Audit Trail</h2>
          <p className="text-sm text-muted-foreground">Full audit trail explorer with date filters and user search coming soon.</p>
        </div>
      )}

      {section === "logs" && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4">System Logs</h2>
          <p className="text-sm text-muted-foreground">Real-time log viewer with severity filtering coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
