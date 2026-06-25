import { useState } from "react";
import { Save, Trash2, Plus, ArrowLeft, ClipboardList, Users, ArrowRight, Undo2, FolderUp, X, StickyNote, CalendarClock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useClientProfiles } from "@/contexts/ClientProfileContext";
import { useRole } from "@/contexts/RoleContext";
import FieldSelect from "@/components/agreements/FieldSelect";
import PaginatedChecklistEditor from "@/components/onboarding/PaginatedChecklistEditor";
import DataCollectionFlow from "@/components/onboarding/DataCollectionFlow";
import StageStepper from "@/components/onboarding/StageStepper";
import ReviewerDecisionPanel from "@/components/onboarding/ReviewerDecisionPanel";
import RequestForInfoEditor from "@/components/onboarding/RequestForInfoEditor";
import DataSourcesEditor from "@/components/onboarding/DataSourcesEditor";
import ActivityLogView from "@/components/onboarding/ActivityLogView";
import TeamAssignEditor from "@/components/onboarding/TeamAssignEditor";
import {
  useOnboardings,
  emptyOnboarding,
  emptyRequest,
  stageLabels,
  stageOrder,
  nextStage,
  requiresCarm,
  proofRequiredStages,
  type Onboarding,
  type OnboardingInput,
  type ServiceType,
  type ReviewDecision,
  type Stage,
} from "@/contexts/OnboardingContext";
import { useMasters } from "@/contexts/MastersContext";

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

type Mode =
  | { kind: "list" }
  | { kind: "form" }
  | { kind: "detail"; onboardingId: string };

export default function OnboardingPage() {
  const { onboardings, deleteOnboarding } = useOnboardings();
  const { profiles } = useClientProfiles();
  const { serviceTypeLabel } = useMasters();
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
                  {serviceTypeLabel(o.serviceType)} · {stageLabels[o.stage]}
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
  const { serviceTemplates, buildChecklist } = useMasters();
  const { toast } = useToast();

  const serviceOptions = serviceTemplates.map((t) => ({ value: t.id, label: t.label }));
  const defaultType = serviceTemplates[0]?.id ?? "";
  const [form, setForm] = useState<OnboardingInput>(() =>
    emptyOnboarding(defaultType, buildChecklist(defaultType)),
  );

  const set = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // A4.2 — switching service type re-seeds the data-collection checklist (A4.3).
  const setServiceType = (serviceType: ServiceType) =>
    setForm((f) => ({ ...f, serviceType, checklist: buildChecklist(serviceType) }));

  const valid = form.clientId !== "" && form.serviceType !== "";

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
              options={serviceOptions}
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

// Per-stage proof upload (gates Next on document stages). Reuses the file-input
// pattern from the former Client Library section, writing to stageProofs[stage].
function ProofUpload({
  files,
  onAdd,
  onRemove,
}: {
  files: string[];
  onAdd: (names: string[]) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <input
        type="file"
        multiple
        className="text-sm"
        onChange={(e) => {
          const added = Array.from(e.target.files ?? []).map((f) => f.name);
          if (added.length > 0) onAdd(added);
          e.target.value = "";
        }}
      />
      {files.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {files.map((name, i) => (
            <li key={i} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <span className="truncate">{name}</span>
              <Button variant="ghost" size="icon" onClick={() => onRemove(i)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Onboarding detail / workflow wizard (A4.1 – A4.14) ─────────────
// One stage per screen: the body switches on the current stage and the footer
// advances with Next (gated by proof on document stages), or via the reviewer
// decision / loop-back controls for the non-linear stages.
function OnboardingDetail({ onboardingId, onBack }: { onboardingId: string; onBack: () => void }) {
  const { onboardings, updateOnboarding, logActivity, addStageProof, setStage } = useOnboardings();
  const { profiles } = useClientProfiles();
  const { serviceTypeLabel } = useMasters();
  const { userName } = useRole();
  const { toast } = useToast();
  const [notesOpen, setNotesOpen] = useState(false);
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
  const carmNeeded = requiresCarm(onboarding.serviceType);
  // Hide the conditional CARM stage from the stepper when it doesn't apply (A4.2).
  const visibleStages = stageOrder.filter((s) => s !== "CarmAccess" || carmNeeded);
  const proofs = (onboarding.stageProofs ?? {})[onboarding.stage] ?? [];

  const onDecide = (decision: Exclude<ReviewDecision, null>) => {
    patch({ reviewDecision: decision });
    if (decision === "Accept") {
      logActivity(onboardingId, "Reviewer accepted client information.");
      setStage(onboardingId, "TradeChainAccess", userName);
    } else if (decision === "AcceptWithEdits") {
      logActivity(onboardingId, "Reviewer accepted with edits — edits saved.");
      setStage(onboardingId, "TradeChainAccess", userName);
    } else {
      logActivity(onboardingId, "Reviewer requested additional information from client.");
      setStage(onboardingId, "InfoRequested", userName);
    }
  };

  // Single linear advance, respecting the branch and the conditional CARM skip.
  const next = nextStage(onboarding.stage, { requiresCarm: carmNeeded });
  const advance = () => {
    if (!next) return;
    if (next === "KickOff") {
      logActivity(onboardingId, `Kick-off meeting scheduled for ${onboarding.kickoffDate}.`);
    }
    setStage(onboardingId, next, userName);
    if (next === "Completed") toast({ title: "Onboarding completed" });
  };

  // A4.10 — trade-chain access required but not provided loops back to a Request
  // For Information (A4.7), notifying the client and moving to Information Requested.
  const requestTradeChainAccess = () => {
    const req = {
      ...emptyRequest(),
      text: "Please provide access to your Trade Chain Partner(s) data records.",
    };
    patch({ requests: [...onboarding.requests, req] });
    logActivity(onboardingId, "Trade Chain Partner access requested from client.");
    setStage(onboardingId, "InfoRequested", userName);
    toast({ title: "Client notified", description: "Trade Chain access request created." });
  };

  // A4.10 / A4.11 — when the client has provided Trade Chain data or has additional
  // data sources, the diagram loops back into A4.3 Data Collection. Re-open the L3
  // sub-flow (fresh run, cumulative DCC Library) and resume the normal path afterward.
  const collectAdditionalData = (reason: string) => {
    patch({ dcStep: "Review", dcAnswers: {} });
    setStage(onboardingId, "DataCollection", userName);
    logActivity(onboardingId, `${reason} — re-opening Data Collection to gather the additional data.`);
    toast({
      title: "Returned to Data Collection",
      description: "Collect the additional data, then continue back through review.",
    });
  };

  // Footer-gate logic.
  const needsProof = proofRequiredStages.includes(onboarding.stage);
  const proofMissing = needsProof && proofs.length === 0;
  const carmIncomplete =
    onboarding.stage === "CarmAccess" && !(onboarding.carmDelegationCorrect && onboarding.carmCadReportRequested);
  // A4.8 — the Data Collection stage can't advance until its L3 sub-flow reaches "Done".
  const dcIncomplete =
    onboarding.stage === "DataCollection" && (onboarding.dcStep ?? "Review") !== "Done";
  const nextBlocked = proofMissing || carmIncomplete || dcIncomplete;

  const proofSection = (
    <section className="border rounded-xl p-5">
      <SectionHeading>
        <span className="inline-flex items-center gap-1">
          <FolderUp className="h-4 w-4" /> Upload Proof
        </span>
      </SectionHeading>
      <p className="text-xs text-muted-foreground mb-3">
        Attach the supporting document(s) for this step before continuing.
      </p>
      <ProofUpload
        files={proofs}
        onAdd={(names) => addStageProof(onboardingId, onboarding.stage, names)}
        onRemove={(i) =>
          patch({
            stageProofs: {
              ...(onboarding.stageProofs ?? {}),
              [onboarding.stage]: proofs.filter((_, j) => j !== i),
            },
          })
        }
      />
    </section>
  );

  const renderStageBody = () => {
    switch (onboarding.stage) {
      case "FormAssigned":
        return (
          <section className="border rounded-xl p-5">
            <SectionHeading>Onboarding Form Assigned</SectionHeading>
            <p className="text-sm text-muted-foreground">
              A Client Onboarding Form has been assigned to <span className="font-medium text-foreground">{clientName}</span>.
              {carmNeeded
                ? " Next, set up CARM access before data collection begins."
                : " Continue to data collection once the client begins providing information."}
            </p>
          </section>
        );

      case "CarmAccess":
        return (
          <section className="border rounded-xl p-5 space-y-4">
            <SectionHeading>CARM Access</SectionHeading>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={onboarding.carmPortalAccessRequested}
                onCheckedChange={(v) => patch({ carmPortalAccessRequested: Boolean(v) })}
              />
              CARM Client Portal access requested
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={onboarding.carmDelegationCorrect}
                onCheckedChange={(v) => patch({ carmDelegationCorrect: Boolean(v) })}
              />
              CARM Delegation of Authority &amp; Visibility access is correct
            </label>
            {!onboarding.carmDelegationCorrect && (
              <p className="text-xs text-muted-foreground pl-6">
                If delegation/visibility is not correct, follow up with the client before proceeding.
              </p>
            )}
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={onboarding.carmCadReportRequested}
                onCheckedChange={(v) => patch({ carmCadReportRequested: Boolean(v) })}
              />
              CAD report requested from CBSA
            </label>
          </section>
        );

      case "DataCollection":
        return (
          <>
            <section className="border rounded-xl p-5">
              <SectionHeading>Data Collection Checklist</SectionHeading>
              <PaginatedChecklistEditor items={onboarding.checklist} onChange={(items) => patch({ checklist: items })} />
            </section>
            <section className="border rounded-xl p-5">
              <SectionHeading>Data Collection Process</SectionHeading>
              <DataCollectionFlow onboarding={onboarding} />
            </section>
          </>
        );

      case "UnderReview":
        return (
          <section className="border rounded-xl p-5">
            <SectionHeading>
              <span className="inline-flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> Reviewer Decision
              </span>
            </SectionHeading>
            <ReviewerDecisionPanel decision={onboarding.reviewDecision} onDecide={onDecide} />
          </section>
        );

      case "InfoRequested":
        return (
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
        );

      case "TradeChainAccess":
        return (
          <>
            <section className="border rounded-xl p-5">
              <SectionHeading>Data Sources &amp; Trade Chain Access</SectionHeading>
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
                  <div className="pl-6 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={onboarding.tradeChainAccessProvided}
                        onCheckedChange={(v) => patch({ tradeChainAccessProvided: Boolean(v) })}
                      />
                      Client has provided Trade Chain Partner(s) access or data
                    </label>
                    {!onboarding.tradeChainAccessProvided ? (
                      <Button variant="outline" size="sm" onClick={requestTradeChainAccess}>
                        <Undo2 className="h-4 w-4 mr-1" /> Request access from client
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => collectAdditionalData("Client provided Trade Chain Partner data")}
                      >
                        <Undo2 className="h-4 w-4 mr-1" /> Collect this data
                      </Button>
                    )}
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={onboarding.additionalDataSources}
                    onCheckedChange={(v) => patch({ additionalDataSources: Boolean(v) })}
                  />
                  Client has additional data sources
                </label>
                {onboarding.additionalDataSources && (
                  <div className="pl-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => collectAdditionalData("Client has additional data sources")}
                    >
                      <Undo2 className="h-4 w-4 mr-1" /> Collect additional data
                    </Button>
                  </div>
                )}
              </div>
            </section>
            {proofSection}
          </>
        );

      case "AssignTeam":
        return (
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
        );

      case "KickOff":
        return (
          <section className="border rounded-xl p-5">
            <SectionHeading>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-4 w-4" /> Project Kick-Off
              </span>
            </SectionHeading>
            <Field label="Kick-Off Meeting Date">
              <input
                type="date"
                className={FIELD}
                value={onboarding.kickoffDate}
                onChange={(e) => patch({ kickoffDate: e.target.value })}
              />
            </Field>
            <p className="mt-3 text-xs text-muted-foreground">
              Set the date, then continue to schedule the kick-off and complete onboarding.
            </p>
          </section>
        );

      case "Completed":
        return (
          <>
            <section className="border rounded-xl p-5">
              <SectionHeading>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Onboarding Complete
                </span>
              </SectionHeading>
              <p className="text-sm text-muted-foreground">
                All onboarding stages are complete. The full record is summarized below.
              </p>
            </section>

            <section className="border rounded-xl p-5">
              <SectionHeading>
                <span className="inline-flex items-center gap-1">
                  <FolderUp className="h-4 w-4" /> Client Library
                </span>
              </SectionHeading>
              {onboarding.uploadedFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {onboarding.uploadedFiles.map((name, i) => (
                    <li key={i} className="border rounded-lg px-3 py-2 truncate">{name}</li>
                  ))}
                </ul>
              )}
            </section>
          </>
        );
    }
  };

  return (
    <div className="p-6">
      <button className="flex items-center gap-1 text-sm text-muted-foreground mb-4" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <PageHeader
        title={clientName}
        description={`${serviceTypeLabel(onboarding.serviceType)} · ${stageLabels[onboarding.stage]}`}
        actions={
          <Button variant="outline" onClick={() => setNotesOpen(true)}>
            <StickyNote className="h-4 w-4 mr-1" /> Notes
            {onboarding.notes.trim() && (
              <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary" title="Has notes" />
            )}
          </Button>
        }
      />

      <div className="border rounded-xl p-5 mb-6">
        <StageStepper
          current={onboarding.stage}
          stages={visibleStages}
          onSelect={(stage) => {
            setStage(onboardingId, stage, userName);
            logActivity(onboardingId, `Returned to "${stageLabels[stage]}" to review/edit.`);
          }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Current stage form + footer nav */}
        <div className="xl:col-span-2 space-y-6">
          {renderStageBody()}

          <div className="flex items-center justify-between border rounded-xl p-4">
            {onboarding.stage === "UnderReview" ? (
              <p className="text-sm text-muted-foreground">
                Use the <span className="font-medium">Reviewer Decision</span> panel above to continue.
              </p>
            ) : onboarding.stage === "Completed" ? (
              <p className="text-sm text-muted-foreground">Onboarding complete.</p>
            ) : dcIncomplete ? (
              <p className="text-sm text-muted-foreground">Complete the data collection process to continue.</p>
            ) : proofMissing ? (
              <p className="text-sm text-muted-foreground">Attach proof to continue.</p>
            ) : carmIncomplete ? (
              <p className="text-sm text-muted-foreground">Confirm CARM delegation &amp; request the CAD report to continue.</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Current stage: <span className="font-medium text-foreground">{stageLabels[onboarding.stage]}</span>
              </p>
            )}
            {next && onboarding.stage !== "UnderReview" && (
              <Button onClick={advance} disabled={nextBlocked}>
                {onboarding.stage === "InfoRequested" ? (
                  <>
                    <Undo2 className="h-4 w-4 mr-1" /> Return to Review
                  </>
                ) : (
                  <>
                    Next: {stageLabels[next]} <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Persistent context: activity log */}
        <div className="space-y-6">
          <section className="border rounded-xl p-5">
            <SectionHeading>Client Activity Log</SectionHeading>
            <ActivityLogView entries={onboarding.activityLog} />
          </section>
        </div>
      </div>

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
