import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ListShell, RowActions, ScreenHeader, BulkActions, PAGE_SIZE } from "./ListShell";
import BulkUploadPanel from "@/components/shared/BulkUploadPanel";
import {
  useUserManagement,
  type EntityStatus,
} from "@/contexts/UserManagementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

const TEMPLATE_COLUMNS = ["Group Name", "Status", "Members"];
const SAMPLE_ROWS = [
  ["Operations Team", "Active", "sarah@ccos.ca;lisa@ccos.ca;james@ccos.ca"],
  ["Compliance Team", "Active", "admin@ccos.ca"],
];

const Step3Groups = ({ onBack }: { onBack: () => void }) => {
  const { groups, users, addGroup, updateGroup, deleteGroup, findGroupByName } = useUserManagement();
  const { toast } = useToast();

  const [mode, setMode] = useState<"list" | "form" | "bulk">("list");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<EntityStatus>("Active");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const resetForm = () => {
    setName("");
    setStatus("Active");
    setMemberIds([]);
    setMemberSearch("");
    setEditingId(null);
  };

  const toggleMember = (id: string) =>
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));

  const openCreate = () => {
    resetForm();
    setMode("form");
  };

  const openEdit = (id: string) => {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    setName(g.name);
    setStatus(g.status);
    setMemberIds(g.memberIds);
    setMemberSearch("");
    setEditingId(id);
    setMode("form");
  };

  const backToList = () => {
    resetForm();
    setMode("list");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ title: "Group Name required", description: "Please enter a group name." });
      return;
    }

    if (!editingId) {
      const existing = findGroupByName(name);
      if (existing) {
        toast({
          title: "Group already exists",
          description: `"${existing.name}" already exists. Opened it for editing.`,
        });
        openEdit(existing.id);
        return;
      }
      addGroup({ name, status, memberIds });
      toast({ title: "Group created", description: `"${name}" has been created.` });
    } else {
      updateGroup(editingId, { name, status, memberIds });
      toast({ title: "Group updated", description: `"${name}" has been updated.` });
    }
    backToList();
  };

  const handleDelete = (id: string, groupName: string) => {
    deleteGroup(id);
    toast({ title: "Group deleted", description: `"${groupName}" has been removed.` });
  };

  const filteredMembers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filtered = useMemo(
    () => groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search]
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (mode === "form") {
    return (
      <div>
        <ScreenHeader onBack={backToList} trail={["Groups", editingId ? "Edit Group" : "New Group"]} />
        <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium block mb-1.5">Group Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="e.g. Compliance Team" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as EntityStatus)} className={FIELD}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Add Users to Group ({memberIds.length} selected)</label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className={`${FIELD} pl-9`}
              placeholder="Search users by name or email..."
            />
          </div>
          <div className="border rounded-lg max-h-56 overflow-y-auto divide-y">
            {filteredMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">No matching users.</p>
            ) : (
              filteredMembers.map((u) => (
                <label key={u.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/40">
                  <Checkbox checked={memberIds.includes(u.id)} onCheckedChange={() => toggleMember(u.id)} />
                  <span className="text-sm font-medium">{u.fullName}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button variant="outline" onClick={backToList}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-1" /> {editingId ? "Update Group" : "Save Group"}
          </Button>
        </div>
        </div>
      </div>
    );
  }

  if (mode === "bulk") {
    return (
      <div>
        <ScreenHeader onBack={backToList} trail={["Groups", "Bulk Upload"]} />
        <BulkUploadPanel entityName="Group" templateColumns={TEMPLATE_COLUMNS} sampleRows={SAMPLE_ROWS} onBack={backToList} />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader onBack={onBack} trail={["Groups"]} />
      <ListShell
      title="Groups"
      count={filtered.length}
      addLabel="Group"
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
        <BulkActions entityName="Group" columns={TEMPLATE_COLUMNS} rows={SAMPLE_ROWS} onBulkUpload={() => setMode("bulk")} />
      }
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Status</th>
            <th>Members</th>
            <th className="!text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted-foreground py-8">No groups found.</td>
            </tr>
          ) : (
            paged.map((g) => (
              <tr key={g.id}>
                <td className="font-medium">{g.name}</td>
                <td>
                  <StatusBadge label={g.status} variant={g.status === "Active" ? "success" : "neutral"} />
                </td>
                <td className="text-muted-foreground">{g.memberIds.length}</td>
                <td>
                  <div className="flex justify-center">
                    <RowActions
                      actions={[
                        { label: "Add / Edit Users", icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(g.id) },
                        {
                          label: "Delete",
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => handleDelete(g.id, g.name),
                          destructive: true,
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

export default Step3Groups;
