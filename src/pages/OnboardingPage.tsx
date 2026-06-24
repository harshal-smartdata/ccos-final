import { useState } from "react";
import { Save, Trash2, Plus, ArrowLeft, ClipboardList, Users, ArrowRight, Undo2, FolderUp, X, StickyNote, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useClientProfiles } from "@/contexts/ClientProfileContext";
import FieldSelect from "@/components/agreements/FieldSelect";
import PaginatedChecklistEditor from "@/components/onboarding/PaginatedChecklistEditor";
import StageStepper from "@/components/onboarding/StageStepper";
import ReviewerDecisionPanel from "@/components/onboarding/ReviewerDecisionPanel";
import RequestForInfoEditor from "@/components/onboarding/RequestForInfoEditor";
import DataSourcesEditor from "@/components/onboarding/DataSourcesEditor";
import ActivityLogView from "@/components/onboarding/ActivityLogView";
import TeamAssignEditor from "@/components/onboarding/TeamAssignEditor";
import {
  useOnboardings,
  emptyOnboarding,
  serviceChecklistTemplate,
  serviceTypeLabels,
  stageLabels,
  nextStage,
  type Onboarding,
  type OnboardingInput,
  type ServiceType,
  type ReviewDecision,
  type Stage,
} from "@/contexts/OnboardingContext";

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

const SERVICE_OPTIONS = (Object.keys(serviceTypeLabels) as ServiceType[]).map((value) => ({
  value,
  label: serviceTypeLabels[value],
}));

type Mode =
  | { kind: "list" }
  | { kind: "form" }
  | { kind: "detail"; onboardingId: string };

export default function OnboardingPage() {
  const { onboardings, deleteOnboarding } = useOnboardings();
  const { profiles } = useClientProfiles();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const clientName = (id: string) => profiles.find((c) => c.id === id)?.companyName ?? "Unlinked";

  if (mode.kind === "form") {
    return <OnboardingForm onBack={() => setMode({ kind: "list" })} onSaved={(id) => setMode({ kind: "detail", onboardingId: id })} />;
  }

  if (mode.kind === "detail") {
    return <OnboardingDetail onboardingId={mode.onboardingId} onBack={() => setMode({ kind: "list" })} />;
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Client Onboarding"
        description="Track each client through the onboarding workflow — data collection, review, and kick-off."
        actions={
          <Button onClick={() => setMode({ kind: "form" })}>
            <Plus className="h-4 w-4 mr-1" /> New Onboarding
          </Button>
        }
      />

      {onboardings.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          No onboardings yet. Start one to assign a Client Onboarding Form.
        </div>
      ) : (
        <div className="space-y-2">
          {onboardings.map((o) => (
            <div key={o.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
              <button className="text-left flex-1" onClick={() => setMode({ kind: "detail", onboardingId: o.id })}>
                <div className="text-sm font-medium">{clientName(o.clientId)}</div>
                <div className="text-xs text-muted-foreground">
                  {serviceTypeLabels[o.serviceType]} · {stageLabels[o.stage]}
                </div>
              </button>
              <span className="text-xs rounded-full bg-primary/10 text-primary border border-primary/30 px-2.5 py-1 mr-2">
                {stageLabels[o.stage]}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteOnboarding(o.id);
                  toast({ title: "Onboarding deleted" });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── New onboarding form (A4.1 / A4.2) ──────────────────────────────
function OnboardingForm({ onBack, onSaved }: { onBack: () => void; onSaved: (id: string) => void }) {
  const { addOnboarding } = useOnboardings();
  const { profiles } = useClientProfiles();
  const { toast } = useToast();
  const [form, setForm] = useState<OnboardingInput>(() => emptyOnboarding());

  const set = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // A4.2 — switching service type re-seeds the data-collection checklist (A4.3).
  const setServiceType = (serviceType: ServiceType) =>
    setForm((f) => ({ ...f, serviceType, checklist: serviceChecklistTemplate(serviceType) }));

  const valid = form.clientId !== "";

  const save = () => {
    if (!valid) {
      toast({ title: "A client is required", variant: "destructive" });
      return;
    }
    const created = addOnboarding(form);
    toast({ title: "Onboarding created", description: "Client notified that an onboarding form requires completion." });
    onSaved(created.id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <button className="flex items-center gap-1 text-sm text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={save} disabled={!valid}>
            <Save className="h-4 w-4 mr-1" /> Create Onboarding
          </Button>
        </div>
      </div>
      <PageHeader title="New Client Onboarding" />

      <section className="border rounded-xl p-5 max-w-2xl">
        <SectionHeading>Setup</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client *">
            <FieldSelect
              value={form.clientId}
              onChange={(v) => set("clientId", v)}
              placeholder="Select client…"
              options={profiles.map((c) => ({ value: c.id, label: c.companyName }))}
            />
          </Field>
          <Field label="Service Type *">
            <FieldSelect
              value={form.serviceType}
              onChange={(v) => setServiceType(v as ServiceType)}
              options={SERVICE_OPTIONS}
            />
          </Field>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          A data-collection checklist will be pre-populated based on the selected service type.
        </p>
      </section>
    </div>
  );
}

// ── Onboarding detail / workflow (A4.3 – A4.14) ────────────────────
function OnboardingDetail({ onboardingId, onBack }: { onboardingId: string; onBack: () => void }) {
  const { onboardings, updateOnboarding, logActivity, setStage } = useOnboardings();
  const { profiles } = useClientProfiles();
  const { toast } = useToast();
  const [notesOpen, setNotesOpen] = useState(false);
  const [kickoffOpen, setKickoffOpen] = useState(false);
  const onboarding = onboardings.find((o) => o.id === onboardingId);

  if (!onboarding) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <p className="mt-4">Onboarding not found.</p>
      </div>
    );
  }

  // Patch one or more fields, persisting immediately.
  const patch = (p: Partial<Onboarding>) => {
    const { id, ...rest } = { ...onboarding, ...p };
    updateOnboarding(id, rest);
  };

  const clientName = profiles.find((c) => c.id === onboarding.clientId)?.companyName ?? "Unlinked";

  const onDecide = (decision: Exclude<ReviewDecision, null>) => {
    patch({ reviewDecision: decision });
    if (decision === "Accept") {
      logActivity(onboardingId, "Reviewer accepted client information.");
      setStage(onboardingId, "TradeChainAccess");
    } else if (decision === "AcceptWithEdits") {
      logActivity(onboardingId, "Reviewer accepted with edits — edits saved.");
      setStage(onboardingId, "TradeChainAccess");
    } else {
      logActivity(onboardingId, "Reviewer requested additional information from client.");
      setStage(onboardingId, "InfoRequested");
    }
  };

  // Single linear advance, respecting the branch. When entering Kick-Off we record
  // the scheduled meeting (A4.14) in the activity log.
  const next = nextStage(onboarding.stage);
  const advance = () => {
    if (!next) return;
    if (next === "KickOff") {
      logActivity(onboardingId, `Kick-off meeting scheduled for ${onboarding.kickoffDate}.`);
    }
    setStage(onboardingId, next);
    if (next === "Completed") toast({ title: "Onboarding completed" });
  };

  return (
    <div className="p-6">
      <button className="flex items-center gap-1 text-sm text-muted-foreground mb-4" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <PageHeader
        title={clientName}
        description={`${serviceTypeLabels[onboarding.serviceType]} · ${stageLabels[onboarding.stage]}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setKickoffOpen(true)}>
              <CalendarClock className="h-4 w-4 mr-1" /> Kick-Off
            </Button>
            <Button variant="outline" onClick={() => setNotesOpen(true)}>
              <StickyNote className="h-4 w-4 mr-1" /> Notes
              {onboarding.notes.trim() && (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary" title="Has notes" />
              )}
            </Button>
          </>
        }
      />

      <div className="border rounded-xl p-5 mb-6 space-y-4">
        <StageStepper current={onboarding.stage} />
        <div className="flex items-center justify-between border-t pt-4">
          {onboarding.stage === "UnderReview" ? (
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-medium">Reviewer Decision</span> panel to continue.
            </p>
          ) : onboarding.stage === "Completed" ? (
            <p className="text-sm text-muted-foreground">Onboarding complete.</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Current stage: <span className="font-medium text-foreground">{stageLabels[onboarding.stage]}</span>
            </p>
          )}
          {next && (
            <Button onClick={advance}>
              {onboarding.stage === "InfoRequested" ? (
                <>
                  <Undo2 className="h-4 w-4 mr-1" /> Return to Review
                </>
              ) : (
                <>
                  Advance to {stageLabels[next]} <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          {/* A4.3 / A4.4 — data collection */}
          <section className="border rounded-xl p-5">
            <SectionHeading>Data Collection Checklist</SectionHeading>
            <PaginatedChecklistEditor items={onboarding.checklist} onChange={(items) => patch({ checklist: items })} />
          </section>

          {/* A4.9 – A4.11 — data sources & trade chain partner access */}
          <section className="border rounded-xl p-5">
            <SectionHeading>Data Sources</SectionHeading>
            <DataSourcesEditor dataSources={onboarding.dataSources} onChange={(ds) => patch({ dataSources: ds })} />
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={onboarding.tradeChainAccessRequired}
                  onCheckedChange={(v) => patch({ tradeChainAccessRequired: Boolean(v) })}
                />
                Access required to client's Trade Chain Partner(s) data records
              </label>
              {onboarding.tradeChainAccessRequired && (
                <label className="flex items-center gap-2 text-sm pl-6">
                  <Checkbox
                    checked={onboarding.tradeChainAccessProvided}
                    onCheckedChange={(v) => patch({ tradeChainAccessProvided: Boolean(v) })}
                  />
                  Client has provided Trade Chain Partner(s) access or data
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={onboarding.additionalDataSources}
                  onCheckedChange={(v) => patch({ additionalDataSources: Boolean(v) })}
                />
                Client has additional data sources
              </label>
            </div>
          </section>

          {/* Client Library — uploaded onboarding forms, records & other documents */}
          <section className="border rounded-xl p-5">
            <SectionHeading>
              <span className="inline-flex items-center gap-1">
                <FolderUp className="h-4 w-4" /> Client Library
              </span>
            </SectionHeading>
            <p className="text-xs text-muted-foreground mb-3">
              Upload onboarding forms, import records, CAD/Firm reports, and other project documents received from the client.
            </p>
            <input
              type="file"
              multiple
              className="text-sm"
              onChange={(e) => {
                const added = Array.from(e.target.files ?? []).map((f) => f.name);
                if (added.length === 0) return;
                patch({ uploadedFiles: [...onboarding.uploadedFiles, ...added] });
                logActivity(
                  onboardingId,
                  `Data received — ${added.length} document(s) uploaded to client library: ${added.join(", ")}.`,
                );
                toast({ title: "Uploaded to client library", description: `${added.length} document(s) added.` });
              }}
            />
            {onboarding.uploadedFiles.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {onboarding.uploadedFiles.map((name, i) => (
                  <li key={i} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <span className="truncate">{name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch({ uploadedFiles: onboarding.uploadedFiles.filter((_, j) => j !== i) })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* A4.12 — assign operational team */}
          <section className="border rounded-xl p-5">
            <SectionHeading>
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" /> Operational Team
              </span>
            </SectionHeading>
            <TeamAssignEditor
              assigned={onboarding.assignedEmployees}
              onChange={(emps) => patch({ assignedEmployees: emps })}
            />
          </section>

        </div>

        <div className="space-y-6">
          {/* A4.5 / A4.6 — Dominion Reviewer Dashboard */}
          <section className="border rounded-xl p-5">
            <SectionHeading>
              <span className="inline-flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> Reviewer Decision
              </span>
            </SectionHeading>
            <ReviewerDecisionPanel decision={onboarding.reviewDecision} onDecide={onDecide} />
          </section>

          {/* A4.7 — request for information */}
          <section className="border rounded-xl p-5">
            <SectionHeading>Requests for Information</SectionHeading>
            <RequestForInfoEditor
              requests={onboarding.requests}
              onChange={(reqs) => patch({ requests: reqs })}
              onRequestAdded={() => {
                logActivity(onboardingId, "Request for information created; client notified.");
                toast({ title: "Client notified", description: "A Request for Information was created." });
              }}
              onMessage={(sender, text) =>
                logActivity(
                  onboardingId,
                  `${sender} message on RFI: "${text.length > 60 ? text.slice(0, 60) + "…" : text}"`,
                )
              }
            />
          </section>

          {/* A4.13 — activity log */}
          <section className="border rounded-xl p-5">
            <SectionHeading>Client Activity Log</SectionHeading>
            <ActivityLogView entries={onboarding.activityLog} />
          </section>
        </div>
      </div>

      {/* Kick-Off popup */}
      <Dialog open={kickoffOpen} onOpenChange={setKickoffOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Project Kick-Off</DialogTitle>
          </DialogHeader>
          <Field label="Kick-Off Meeting Date">
            <input
              type="date"
              className={FIELD}
              value={onboarding.kickoffDate}
              onChange={(e) => patch({ kickoffDate: e.target.value })}
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Set the date, then use the <span className="font-medium">Advance</span> control to schedule the kick-off and complete onboarding.
          </p>
        </DialogContent>
      </Dialog>

      {/* Notes popup */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notes</DialogTitle>
          </DialogHeader>
          <textarea
            className={FIELD}
            rows={10}
            autoFocus
            placeholder="Add notes for this onboarding…"
            value={onboarding.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
