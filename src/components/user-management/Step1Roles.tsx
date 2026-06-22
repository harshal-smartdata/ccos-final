import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { navItems } from "@/config/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { ListShell, RowActions, ScreenHeader, BulkActions, PAGE_SIZE } from "./ListShell";
import BulkUploadPanel from "@/components/shared/BulkUploadPanel";
import {
  useUserManagement,
  ALL_PERMISSIONS,
  getRoleModules,
  type Permission,
  type ModulePermissions,
} from "@/contexts/UserManagementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

const MODULE_OPTIONS = navItems.filter((n) => n.label !== "Dashboard").map((n) => n.label);

const TEMPLATE_COLUMNS = ["Role Name", "Description", "Modules", "Permissions"];
const SAMPLE_ROWS = [
  ["Senior Consultant", "Handles complex client files", "Clients;CADs;Tasks", "Read;Write"],
  ["Auditor", "Read-only access for reviews", "Clients;Reports", "Read;Download"],
];

const emptyForm = {
  name: "",
  description: "",
  modulePermissions: {} as ModulePermissions,
};

const Step1Roles = ({ onBack }: { onBack: () => void }) => {
  const { roles, addRole, updateRole, deleteRole, findRoleByName } = useUserManagement();
  const { toast } = useToast();
  const [mode, setMode] = useState<"list" | "form" | "bulk">("list");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ---- Module × permission matrix helpers ----
  const hasPerm = (module: string, perm: Permission) =>
    form.modulePermissions[module]?.includes(perm) ?? false;

  const togglePerm = (module: string, perm: Permission) =>
    setForm((f) => {
      const current = f.modulePermissions[module] ?? [];
      const next = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
      const modulePermissions = { ...f.modulePermissions };
      if (next.length === 0) delete modulePermissions[module];
      else modulePermissions[module] = ALL_PERMISSIONS.filter((p) => next.includes(p));
      return { ...f, modulePermissions };
    });

  // Toggle an entire module row: grant all permissions, or clear it.
  const toggleModule = (module: string) =>
    setForm((f) => {
      const modulePermissions = { ...f.modulePermissions };
      if (modulePermissions[module]?.length) delete modulePermissions[module];
      else modulePermissions[module] = [...ALL_PERMISSIONS];
      return { ...f, modulePermissions };
    });

  // Toggle a permission column across every module.
  const toggleColumn = (perm: Permission) =>
    setForm((f) => {
      const allOn = MODULE_OPTIONS.every((m) => f.modulePermissions[m]?.includes(perm));
      const modulePermissions: ModulePermissions = { ...f.modulePermissions };
      MODULE_OPTIONS.forEach((m) => {
        const current = modulePermissions[m] ?? [];
        const next = allOn ? current.filter((p) => p !== perm) : Array.from(new Set([...current, perm]));
        if (next.length === 0) delete modulePermissions[m];
        else modulePermissions[m] = ALL_PERMISSIONS.filter((p) => next.includes(p));
      });
      return { ...f, modulePermissions };
    });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("form");
  };

  const openEdit = (id: string) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    setForm({
      name: role.name,
      description: role.description,
      modulePermissions: { ...role.modulePermissions },
    });
    setEditingId(id);
    setMode("form");
  };

  const backToList = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("list");
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: "Role Name required", description: "Please enter a role name." });
      return;
    }

    if (!editingId) {
      const existing = findRoleByName(form.name);
      if (existing) {
        toast({
          title: "Role already exists",
          description: `"${existing.name}" is already defined. Opened it for editing instead.`,
        });
        openEdit(existing.id);
        return;
      }
      addRole(form);
      toast({ title: "Role created", description: `"${form.name}" has been added.` });
    } else {
      updateRole(editingId, form);
      toast({ title: "Role updated", description: `"${form.name}" has been updated.` });
    }
    backToList();
  };

  const handleDelete = (id: string, name: string) => {
    deleteRole(id);
    toast({ title: "Role deleted", description: `"${name}" has been removed.` });
  };

  const filtered = useMemo(
    () =>
      roles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase())
      ),
    [roles, search]
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (mode === "form") {
    return (
      <div>
        <ScreenHeader onBack={backToList} trail={["Roles", editingId ? "Edit Role" : "New Role"]} />
        <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1.5">Role Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={FIELD}
                placeholder="e.g. Senior Consultant"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Role Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={FIELD}
                placeholder="Brief description of the role"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-sm font-medium">Module Permissions</label>
              <span className="text-xs text-muted-foreground">
                Grant each permission per module. Click a module or column header to toggle a whole row/column.
              </span>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 border-b">
                    <th className="text-left font-medium px-4 py-2.5">Module</th>
                    {ALL_PERMISSIONS.map((p) => (
                      <th key={p} className="px-3 py-2.5 text-center font-medium w-24">
                        <button
                          type="button"
                          onClick={() => toggleColumn(p)}
                          className="hover:text-primary transition-colors"
                          title={`Toggle ${p} for all modules`}
                        >
                          {p}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULE_OPTIONS.map((m) => {
                    const moduleOn = (form.modulePermissions[m]?.length ?? 0) > 0;
                    return (
                      <tr key={m} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => toggleModule(m)}
                            className={`font-medium transition-colors ${moduleOn ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            title="Toggle all permissions for this module"
                          >
                            {m}
                          </button>
                        </td>
                        {ALL_PERMISSIONS.map((p) => (
                          <td key={p} className="px-3 py-2 text-center">
                            <div className="flex justify-center">
                              <Checkbox checked={hasPerm(m, p)} onCheckedChange={() => togglePerm(m, p)} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button variant="outline" onClick={backToList}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-1" /> {editingId ? "Update Role" : "Save Role"}
          </Button>
        </div>
        </div>
      </div>
    );
  }

  if (mode === "bulk") {
    return (
      <div>
        <ScreenHeader onBack={backToList} trail={["Roles", "Bulk Upload"]} />
        <BulkUploadPanel entityName="Role" templateColumns={TEMPLATE_COLUMNS} sampleRows={SAMPLE_ROWS} onBack={backToList} />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader onBack={onBack} trail={["Roles"]} />
      <ListShell
      title="Roles"
      count={filtered.length}
      addLabel="Role"
      onAdd={openCreate}
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
      page={safePage}
      pageCount={pageCount}
      onPageChange={setPage}
      headerActions={
        <BulkActions entityName="Role" columns={TEMPLATE_COLUMNS} rows={SAMPLE_ROWS} onBulkUpload={() => setMode("bulk")} />
      }
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Description</th>
            <th>Modules</th>
            <th className="!text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted-foreground py-8">
                No roles found.
              </td>
            </tr>
          ) : (
            paged.map((r) => {
              const modules = getRoleModules(r);
              return (
              <tr key={r.id}>
                <td className="font-medium">{r.name}</td>
                <td className="text-muted-foreground max-w-xs truncate">{r.description || "—"}</td>
                <td className="text-muted-foreground">
                  {modules.length === 0 ? "—" : `${modules.length} module${modules.length === 1 ? "" : "s"}`}
                </td>
                <td>
                  <div className="flex justify-center">
                    <RowActions
                      actions={[
                        { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(r.id) },
                        {
                          label: "Delete",
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handleDelete(r.id, r.name),
                          destructive: true,
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
      </ListShell>
    </div>
  );
};

export default Step1Roles;
