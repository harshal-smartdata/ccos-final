import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Save, Pencil, UserX, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ListShell, RowActions, ScreenHeader, BulkActions, PAGE_SIZE } from "./ListShell";
import BulkUploadPanel from "@/components/shared/BulkUploadPanel";
import {
  useUserManagement,
  getRoleModules,
  type JobType,
} from "@/contexts/UserManagementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

const JOB_TYPES: JobType[] = ["Full Time", "Part Time", "Contract"];

const TEMPLATE_COLUMNS = [
  "Full Name",
  "Email",
  "Job Title",
  "Contact Number",
  "Direct Line",
  "Extension",
  "Mobile Number",
  "Role",
  "Reports To",
  "Job Type",
];
const SAMPLE_ROWS = [
  ["Sarah Chen", "sarah@ccos.ca", "Customs Consultant", "+1 (416) 555-0123", "", "", "", "Consultant", "James Wilson", "Full Time"],
  ["James Wilson", "james@ccos.ca", "Operations Manager", "+1 (416) 555-0456", "", "", "", "Manager", "", "Full Time"],
];

const emptyForm = {
  fullName: "",
  email: "",
  contactNumber: "",
  directLine: "",
  extension: "",
  mobileNumber: "",
  jobTitle: "",
  roleId: "",
  reportsToId: "",
  jobType: "Full Time" as JobType,
  startDate: "",
  endDate: "",
};

const Step2UserProfiles = ({ onBack }: { onBack: () => void }) => {
  const { roles, users, addUser, updateUser, toggleUserStatus } = useUserManagement();
  const { toast } = useToast();
  const [mode, setMode] = useState<"list" | "form" | "bulk">("list");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const selectedRole = roles.find((r) => r.id === form.roleId);
  const showDates = form.jobType === "Part Time" || form.jobType === "Contract";
  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? "—";

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("form");
  };

  const openEdit = (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    setForm({
      fullName: u.fullName,
      email: u.email,
      contactNumber: u.contactNumber,
      directLine: u.directLine,
      extension: u.extension,
      mobileNumber: u.mobileNumber,
      jobTitle: u.jobTitle,
      roleId: u.roleId,
      reportsToId: u.reportsToId,
      jobType: u.jobType,
      startDate: u.startDate ?? "",
      endDate: u.endDate ?? "",
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
    if (!form.fullName.trim() || !form.email.trim() || !form.roleId) {
      toast({ title: "Missing required fields", description: "Full Name, Email and Role are required." });
      return;
    }
    const payload = {
      ...form,
      startDate: showDates ? form.startDate : undefined,
      endDate: showDates ? form.endDate : undefined,
    };

    if (editingId) {
      updateUser(editingId, payload);
      toast({ title: "Profile updated", description: `${form.fullName} has been updated.` });
    } else {
      addUser(payload);
      toast({ title: "Profile created", description: `${form.fullName} has been added.` });
    }
    backToList();
  };

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          roleName(u.roleId).toLowerCase().includes(search.toLowerCase())
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, roles, search]
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (mode === "form") {
    return (
      <div>
        <ScreenHeader onBack={backToList} trail={["User Profiles", editingId ? "Edit User" : "New User"]} />
        <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1.5">Full Name *</label>
              <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={FIELD} placeholder="Full name" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={FIELD} placeholder="name@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Job Title</label>
              <input value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} className={FIELD} placeholder="e.g. Customs Consultant" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Contact Number</label>
              <input value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)} className={FIELD} placeholder="(000) 000-0000" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Direct Line</label>
              <input value={form.directLine} onChange={(e) => update("directLine", e.target.value)} className={FIELD} placeholder="Direct line" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Extension</label>
              <input value={form.extension} onChange={(e) => update("extension", e.target.value)} className={FIELD} placeholder="Ext." />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Mobile Number</label>
              <input value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} className={FIELD} placeholder="Mobile" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Role *</label>
              <select value={form.roleId} onChange={(e) => update("roleId", e.target.value)} className={FIELD}>
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Reports To</label>
              <select value={form.reportsToId} onChange={(e) => update("reportsToId", e.target.value)} className={FIELD}>
                <option value="">None</option>
                {users.filter((u) => u.id !== editingId).map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Job Type</label>
              <select value={form.jobType} onChange={(e) => update("jobType", e.target.value)} className={FIELD}>
                {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            {showDates && (
              <>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} className={FIELD} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className={FIELD} />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Access from role</label>
            {!selectedRole ? (
              <div className="flex items-center min-h-[2.5rem] bg-secondary/40 border rounded-lg px-3 py-2">
                <span className="text-sm text-muted-foreground">Select a role to see which modules and permissions this user inherits.</span>
              </div>
            ) : getRoleModules(selectedRole).length === 0 ? (
              <div className="flex items-center min-h-[2.5rem] bg-secondary/40 border rounded-lg px-3 py-2">
                <span className="text-sm text-muted-foreground">
                  "{selectedRole.name}" has no module access configured yet.
                </span>
              </div>
            ) : (
              <div className="border rounded-lg divide-y overflow-hidden">
                {getRoleModules(selectedRole).map((m) => (
                  <div key={m} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-sm font-medium">{m}</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {selectedRole.modulePermissions[m].map((p) => (
                        <StatusBadge key={p} label={p} variant="neutral" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button variant="outline" onClick={backToList}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-1" /> {editingId ? "Update Profile" : "Save Profile"}
          </Button>
        </div>
        </div>
      </div>
    );
  }

  if (mode === "bulk") {
    return (
      <div>
        <ScreenHeader onBack={backToList} trail={["User Profiles", "Bulk Upload"]} />
        <BulkUploadPanel entityName="User" templateColumns={TEMPLATE_COLUMNS} sampleRows={SAMPLE_ROWS} onBack={backToList} />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader onBack={onBack} trail={["User Profiles"]} />
      <ListShell
      title="User Profiles"
      count={filtered.length}
      addLabel="User"
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
        <BulkActions entityName="User" columns={TEMPLATE_COLUMNS} rows={SAMPLE_ROWS} onBulkUpload={() => setMode("bulk")} />
      }
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Job Type</th>
            <th>Status</th>
            <th className="!text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted-foreground py-8">No user profiles found.</td>
            </tr>
          ) : (
            paged.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.fullName}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td>{roleName(u.roleId)}</td>
                <td className="text-muted-foreground">{u.jobType}</td>
                <td>
                  <StatusBadge label={u.status} variant={u.status === "Active" ? "success" : "neutral"} />
                </td>
                <td>
                  <div className="flex justify-center">
                    <RowActions
                      actions={[
                        { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(u.id) },
                        u.status === "Active"
                          ? {
                              label: "Deactivate",
                              icon: <UserX className="h-4 w-4" />,
                              onClick: () => toggleUserStatus(u.id),
                              destructive: true,
                            }
                          : {
                              label: "Activate",
                              icon: <UserCheck className="h-4 w-4" />,
                              onClick: () => toggleUserStatus(u.id),
                            },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </ListShell>
    </div>
  );
};

export default Step2UserProfiles;
