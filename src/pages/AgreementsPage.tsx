import { useState } from "react";
import { Save, Pencil, Trash2, Plus, ArrowLeft, FolderOpen, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  useAgreements,
  emptyAgreement,
  emptySubProject,
  salesReps,
  workManagementReps,
  type Project,
  type ProjectInput,
  type AgreementType,
} from "@/contexts/AgreementContext";
import { useClientProfiles } from "@/contexts/ClientProfileContext";
import FieldSelect from "@/components/agreements/FieldSelect";
import ChecklistEditor from "@/components/agreements/ChecklistEditor";
import AuditTeamSelect from "@/components/agreements/AuditTeamSelect";
import AgreementBillingEditor from "@/components/agreements/AgreementBillingEditor";
import ProjectBillingSetupDialog from "@/components/agreements/ProjectBillingSetupDialog";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold mb-4 border-b pb-2">{children}</h3>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    <div className="mt-1">{children}</div>
  </div>
);

const AGREEMENT_TYPES: AgreementType[] = [
  "Annual Agreement",
  "One-time Declaration",
  "Specific Shipment Agreement",
  "Master Service Agreement",
];

type Mode =
  | { kind: "list" }
  | { kind: "form"; editingId: string | null }
  | { kind: "detail"; agreementId: string };

export default function AgreementsPage() {
  const { agreements, subProjectsOf, deleteProject } = useAgreements();
  const { profiles } = useClientProfiles();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const clientName = (id: string) => profiles.find((c) => c.id === id)?.companyName ?? "Unlinked";

  if (mode.kind === "form") {
    return (
      <AgreementForm
        editingId={mode.editingId}
        onBack={() => setMode({ kind: "list" })}
        onSaved={() => setMode({ kind: "list" })}
      />
    );
  }

  if (mode.kind === "detail") {
    return (
      <AgreementDetail
        agreementId={mode.agreementId}
        onBack={() => setMode({ kind: "list" })}
      />
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Agreements"
        description="Manage client agreements and their service projects."
        actions={
          <Button onClick={() => setMode({ kind: "form", editingId: null })}>
            <Plus className="h-4 w-4 mr-1" /> New Agreement
          </Button>
        }
      />

      {agreements.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          No agreements yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-2">
          {agreements.map((a) => (
            <div key={a.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
              <button className="text-left flex-1" onClick={() => setMode({ kind: "detail", agreementId: a.id })}>
                <div className="text-sm font-medium">
                  {a.agreementNumber} · {a.name || "(unnamed)"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {clientName(a.clientId)} · {a.agreementType} · {subProjectsOf(a.id).length} project(s) · {a.agreementBillingModels.length} billing model(s)
                </div>
              </button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setMode({ kind: "form", editingId: a.id })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteProject(a.id);
                    toast({ title: "Agreement deleted" });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Agreement form ─────────────────────────────────────────────────
function AgreementForm({
  editingId,
  onBack,
  onSaved,
}: {
  editingId: string | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const { agreements, addProject, updateProject, nextAgreementNumber } = useAgreements();
  const { profiles } = useClientProfiles();
  const { toast } = useToast();
  const existing = editingId ? agreements.find((a) => a.id === editingId) : null;

  const [form, setForm] = useState<ProjectInput>(() => {
    if (existing) {
      const { id, ...rest } = existing;
      return rest;
    }
    return emptyAgreement();
  });

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = form.name.trim() !== "" && form.clientId !== "" && form.declarationAccepted;

  const save = () => {
    if (!valid) {
      toast({ title: "Client, agreement name and declaration are required", variant: "destructive" });
      return;
    }
    if (existing) {
      updateProject(existing.id, form);
      toast({ title: "Agreement updated" });
    } else {
      addProject(form);
      toast({ title: "Agreement created" });
    }
    onSaved();
  };

  const previewNumber = existing ? form.agreementNumber : nextAgreementNumber();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <button className="flex items-center gap-1 text-sm text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={save} disabled={!valid}>
            <Save className="h-4 w-4 mr-1" /> Save Agreement
          </Button>
        </div>
      </div>
      <PageHeader title={existing ? "Edit Agreement" : "New Agreement"} />

      {/* Two-column layout: primary details on the left, supporting panels on the right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <section className="border rounded-xl p-5">
            <SectionHeading>Agreement Details</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Client *">
                <FieldSelect
                  value={form.clientId}
                  onChange={(v) => set("clientId", v)}
                  placeholder="Select client…"
                  options={profiles.map((c) => ({ value: c.id, label: c.companyName }))}
                />
              </Field>
              <Field label="Agreement Number">
                <input className={FIELD + " bg-muted text-muted-foreground"} disabled value={previewNumber} />
              </Field>
              <Field label="Agreement Type *">
                <FieldSelect
                  value={form.agreementType}
                  onChange={(v) => set("agreementType", v as AgreementType)}
                  options={AGREEMENT_TYPES as unknown as string[]}
                />
              </Field>
              <Field label="Agreement Name *">
                <input className={FIELD} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Effective Date *">
                <input type="date" className={FIELD} value={form.effectiveDate} onChange={(e) => set("effectiveDate", e.target.value)} />
              </Field>
              <Field label="Expiry Date *">
                <input type="date" className={FIELD} value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
              </Field>
              <div className="hidden lg:block" />
              <Field label="Dominion Sales Rep *">
                <FieldSelect value={form.salesRep} onChange={(v) => set("salesRep", v)} options={salesReps} />
              </Field>
              <Field label="Dominion WM Rep *">
                <FieldSelect value={form.workManagementRep} onChange={(v) => set("workManagementRep", v)} options={workManagementReps} />
              </Field>
            </div>
          </section>

          <section className="border rounded-xl p-5">
            <SectionHeading>Billing Models</SectionHeading>
            <AgreementBillingEditor
              models={form.agreementBillingModels}
              onChange={(models) => setForm((f) => ({ ...f, agreementBillingModels: models }))}
            />
          </section>

          <section className="border rounded-xl p-5">
            <SectionHeading>Notes / Instructions</SectionHeading>
            <textarea className={FIELD} rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="border rounded-xl p-5">
            <SectionHeading>Agreement Checklist</SectionHeading>
            <ChecklistEditor items={form.agreementChecklist} onChange={(items) => set("agreementChecklist", items)} />
          </section>

          <section className="border rounded-xl p-5">
            <SectionHeading>Supporting Documents</SectionHeading>
            <input
              type="file"
              multiple
              className="text-sm"
              onChange={(e) =>
                set("uploadedFiles", [
                  ...form.uploadedFiles,
                  ...Array.from(e.target.files ?? []).map((f) => f.name),
                ])
              }
            />
            {form.uploadedFiles.length > 0 && (
              <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                {form.uploadedFiles.map((name, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {name}
                    <button className="text-xs underline" onClick={() => set("uploadedFiles", form.uploadedFiles.filter((_, j) => j !== i))}>
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border rounded-xl p-5 bg-muted/30">
            <label className="flex items-start gap-2">
              <Checkbox checked={form.declarationAccepted} onCheckedChange={(v) => set("declarationAccepted", Boolean(v))} className="mt-0.5" />
              <span className="text-sm">
                I declare the information in this agreement is accurate and complete. *
              </span>
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Agreement detail (sub-projects) ────────────────────────────────
function AgreementDetail({ agreementId, onBack }: { agreementId: string; onBack: () => void }) {
  const { agreements, subProjectsOf, addProject, updateProject, deleteProject } = useAgreements();
  const { profiles } = useClientProfiles();
  const { toast } = useToast();
  const agreement = agreements.find((a) => a.id === agreementId);
  const [adding, setAdding] = useState(false);
  const [billingProject, setBillingProject] = useState<Project | null>(null);

  if (!agreement) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <p className="mt-4">Agreement not found.</p>
      </div>
    );
  }

  const projects = subProjectsOf(agreementId);

  return (
    <div className="p-6">
      <button className="flex items-center gap-1 text-sm text-muted-foreground mb-4" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <PageHeader
        title={`${agreement.agreementNumber} · ${agreement.name}`}
        description={`${profiles.find((c) => c.id === agreement.clientId)?.companyName ?? "Unlinked"} · ${agreement.agreementType}`}
        actions={
          !adding && (
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Project
            </Button>
          )
        }
      />

      {adding && (
        <SubProjectForm
          agreementId={agreementId}
          onCancel={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            toast({ title: "Project added" });
          }}
        />
      )}

      <h3 className="text-sm font-semibold mt-6 mb-2 flex items-center gap-1">
        <FolderOpen className="h-4 w-4" /> Service Projects
      </h3>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.assignedTo} · {p.priority} · due {p.dueDate}
                  {p.billingType ? ` · billing: ${p.billingType}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" title="Billing setup" onClick={() => setBillingProject(p)}>
                  <Receipt className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { deleteProject(p.id); toast({ title: "Project deleted" }); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectBillingSetupDialog
        open={billingProject !== null}
        project={billingProject}
        onClose={() => setBillingProject(null)}
        onSave={(patch) => {
          if (billingProject) {
            const { id, ...rest } = billingProject;
            updateProject(billingProject.id, { ...rest, ...patch });
            toast({ title: "Billing updated" });
          }
        }}
      />
    </div>
  );
}

// ── Sub-project form ───────────────────────────────────────────────
function SubProjectForm({
  agreementId,
  onCancel,
  onSaved,
}: {
  agreementId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { addProject } = useAgreements();
  const { toast } = useToast();
  const [form, setForm] = useState<ProjectInput>(() => emptySubProject(agreementId));

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (!form.name.trim()) {
      toast({ title: "Project name is required", variant: "destructive" });
      return;
    }
    addProject(form);
    onSaved();
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Service Project Name *">
          <input className={FIELD} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Assigned To *">
          <FieldSelect value={form.assignedTo} onChange={(v) => set("assignedTo", v)} options={workManagementReps} />
        </Field>
        <Field label="Priority *">
          <FieldSelect
            value={form.priority}
            onChange={(v) => set("priority", v as ProjectInput["priority"])}
            options={["High", "Medium", "Low"]}
          />
        </Field>
        <Field label="Target Due Date *">
          <input type="date" className={FIELD} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Field label="Project Checklist">
          <ChecklistEditor items={form.checklist} onChange={(items) => set("checklist", items)} />
        </Field>

        <Field label="Audit Team">
          <AuditTeamSelect
            team={form.auditTeam}
            allocations={form.auditAllocations}
            onChange={(team, allocations) => setForm((f) => ({ ...f, auditTeam: team, auditAllocations: allocations }))}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={save} disabled={!form.name.trim()}>
          <Save className="h-4 w-4 mr-1" /> Save Project
        </Button>
      </div>
    </div>
  );
}
