import React, { createContext, useContext, useState, useEffect } from "react";
import { type ChecklistItem } from "@/contexts/AgreementContext";

// ── Operational employees (static seed) ────────────────────────────
export const operationalEmployees = [
  "Amara Okafor",
  "Daniel Reyes",
  "Priya Nair",
  "Marcus Lee",
  "Sofia Almeida",
];

// ── Domain types (mapped from flowchart 1:A4 — Client Onboarding L2) ─
// Service types are now user-editable master data (see MastersContext); a
// ServiceType is the id of a ServiceTemplate. Labels and checklist templates
// are resolved through useMasters() rather than hardcoded here.
export type ServiceType = string;

// Stages follow the flowchart left-to-right.
export type Stage =
  | "FormAssigned" // A4.1 / A4.2
  | "CarmAccess" // A4.3 / A4.4 / A4.5 — CARM portal access, delegation check, CAD report (conditional)
  | "DataCollection" // A4.3 / A4.4
  | "UnderReview" // A4.5 / A4.6
  | "InfoRequested" // A4.7
  | "TradeChainAccess" // A4.9 – A4.11
  | "AssignTeam" // A4.12
  | "KickOff" // A4.14
  | "Completed";

export const stageOrder: Stage[] = [
  "FormAssigned",
  "CarmAccess",
  "DataCollection",
  "UnderReview",
  "InfoRequested",
  "TradeChainAccess",
  "AssignTeam",
  "KickOff",
  "Completed",
];

/**
 * A4.2 — the CARM sub-branch (A4.3 portal access → A4.4 delegation check → A4.5
 * CAD report) applies only when the project is NOT a Managed Services or Software
 * License profile. These seeded service-type ids are the exemptions; any other
 * (e.g. Project Based, or custom) service type takes the CARM path.
 */
const carmExemptServiceTypes = new Set<ServiceType>([
  "ManagedServices",
  "LicensingClientManaged",
  "LicensingDominionSupported",
]);

export const requiresCarm = (serviceType: ServiceType): boolean =>
  !carmExemptServiceTypes.has(serviceType);

/**
 * Linear progression of the onboarding flow. `UnderReview` is a fork resolved by
 * the reviewer decision (A4.6), so it has no automatic next stage. `InfoRequested`
 * loops back to `UnderReview` once the client responds. The `CarmAccess` stage
 * (A4.3–A4.5) is skipped for CARM-exempt service types (A4.2). Returns null where
 * there is no single next stage (the review fork, and the terminal Completed stage).
 */
export const nextStage = (stage: Stage, opts?: { requiresCarm?: boolean }): Stage | null => {
  switch (stage) {
    case "FormAssigned":
      return opts?.requiresCarm ? "CarmAccess" : "DataCollection";
    case "CarmAccess":
      return "DataCollection";
    case "DataCollection":
      return "UnderReview";
    case "UnderReview":
      return null; // resolved by reviewer decision
    case "InfoRequested":
      return "UnderReview"; // re-submit after client responds
    case "TradeChainAccess":
      return "AssignTeam";
    case "AssignTeam":
      return "KickOff";
    case "KickOff":
      return "Completed";
    case "Completed":
      return null;
  }
};

export const stageLabels: Record<Stage, string> = {
  FormAssigned: "Form Assigned",
  CarmAccess: "CARM Access",
  DataCollection: "Data Collection",
  UnderReview: "Under Review",
  InfoRequested: "Information Requested",
  TradeChainAccess: "Trade Chain Access",
  AssignTeam: "Assign Team",
  KickOff: "Kick-Off",
  Completed: "Completed",
};

/** Stages that require a proof document to be attached before advancing. */
export const proofRequiredStages: Stage[] = ["TradeChainAccess"];

// ── A4.8 — Data Collection Process (L3 sub-flow) ───────────────────
// A nested state machine that runs while stage === "DataCollection". Mirrors the
// `Stage` / `nextStage` pattern above. Reaching "Done" is what unblocks the main
// Next → Under Review advance.
export type DcStep =
  | "Review" // A4.8.1 Review available data sources
  | "Integration" // A4.8.2 decision → A4.8.3 Execute & Test System Integration
  | "CustomTemplate" // A4.8.4 decision → A4.8.5 Develop & Test custom template(s)
  | "HistoricalSources" // A4.8.6/7/8 multi-select — which historical data sources are providing data (all optional)
  | "CbsaRequest" // A4.8.10 Request CAD & FIRM Reports / A4.8.12 Create Request to CBSA
  | "CbsaReview" // A4.8.11 CBSA data acceptable? (loops to CbsaRequest on No)
  | "DccLibrary" // A4.8.9 Add Data & Documentation to DCC Library (the sink)
  | "Recurring" // A4.8.13 reoccurring new data collection requirements?
  | "DevValidation" // A4.8.15/16/17 System Integration vs Manual Process dev + client validation
  | "StandaloneLicensing" // A4.8.14 standalone software licensing exit question
  | "Done"; // sub-flow complete → unblocks Next to Under Review

/** Display order of the A4.8 sub-steps (for the sub-stepper). "Done" is terminal/hidden. */
export const dcStepOrder: DcStep[] = [
  "Review",
  "Integration",
  "CustomTemplate",
  "HistoricalSources",
  "CbsaRequest",
  "CbsaReview",
  "DccLibrary",
  "Recurring",
  "DevValidation",
  "StandaloneLicensing",
];

export const dcStepLabels: Record<DcStep, string> = {
  Review: "Review Data Sources",
  Integration: "System Integration",
  CustomTemplate: "Custom Template",
  HistoricalSources: "Historical Data Sources",
  CbsaRequest: "Request to CBSA",
  CbsaReview: "CBSA Data Acceptable?",
  DccLibrary: "Add to DCC Library",
  Recurring: "Recurring Requirements?",
  DevValidation: "Develop & Validate",
  StandaloneLicensing: "Standalone Licensing?",
  Done: "Data Collection Complete",
};

/** Decision answers keyed by step/flag name (e.g. integrationRequired, customTemplate). */
export type DcAnswers = Partial<Record<string, boolean>>;

/**
 * Pure progression for the A4.8 sub-flow, encoding the diagram's edges. Decision
 * steps read their boolean answer out of `answers`; an undefined answer means the
 * decision hasn't been made yet, so the step holds (returns itself). Loops:
 * CbsaReview "No" → CbsaRequest; DevValidation not-validated → DevValidation.
 *
 * The A4.8.15-17 development/validation cluster is genuinely ambiguous in the source
 * diagram (the SYSTEM INTEGRATION / MANUAL PROCESS labels off A4.8.13 don't fully
 * determine routing). Chosen reading: a "Yes" to recurring requirements (A4.8.13)
 * routes into a single DevValidation step whose track (system-integration vs manual
 * process) is decided by the earlier `integrationRequired` answer (A4.8.2); the A4.8.17
 * client-validation gate must pass (`dataValidated`) before the sub-flow completes.
 * A4.8.13 "No" routes to A4.8.14 (StandaloneLicensing), whose answer records the exit
 * route in `dcOutcome` (No → A4.2 L2, Yes → B4 L2) and then completes the sub-flow.
 */
export const nextDcStep = (step: DcStep, answers: DcAnswers): DcStep | null => {
  const yes = (k: string) => answers[k] === true;
  const answered = (k: string) => answers[k] !== undefined;
  switch (step) {
    case "Review":
      return "Integration";
    case "Integration":
      // A4.8.2 — Yes runs A4.8.3 then continues; either way → A4.8.4.
      return answered("integrationRequired") ? "CustomTemplate" : "Integration";
    case "CustomTemplate":
      // A4.8.4 — Yes runs A4.8.5 then continues; either way → A4.8.6.
      return answered("customTemplate") ? "HistoricalSources" : "CustomTemplate";
    case "HistoricalSources":
      // A4.8.6/7/8 — multi-select of which sources are providing historical data
      // (Client / Trade Chain Partner / Dominion portal); all optional. Any source
      // selected → add to DCC Library; none selected → request the reports from CBSA.
      if (!answered("historicalSourcesConfirmed")) return "HistoricalSources";
      return yes("clientHistorical") || yes("partnerHistorical") || yes("dominionPortal")
        ? "DccLibrary"
        : "CbsaRequest";
    case "CbsaRequest":
      return "CbsaReview";
    case "CbsaReview":
      if (!answered("cbsaAcceptable")) return "CbsaReview";
      return yes("cbsaAcceptable") ? "DccLibrary" : "CbsaRequest"; // No loops back
    case "DccLibrary":
      return "Recurring";
    case "Recurring":
      // A4.8.13 — Yes → System Integration / Manual Process dev & testing (A4.8.15-17);
      // No → A4.8.14 standalone-licensing exit question.
      if (!answered("recurring")) return "Recurring";
      return yes("recurring") ? "DevValidation" : "StandaloneLicensing";
    case "DevValidation":
      // A4.8.17 — must be confirmed/validated by the client to complete.
      return yes("dataValidated") ? "Done" : "DevValidation";
    case "StandaloneLicensing":
      // A4.8.14 — both answers exit the sub-flow (No → 1:A4.2 L2, Yes → 1:B4 L2);
      // the chosen route is recorded in dcOutcome.
      return answered("standaloneLicensing") ? "Done" : "StandaloneLicensing";
    case "Done":
      return null;
  }
};

export type ReviewDecision = "Accept" | "AcceptWithEdits" | "RequestInfo" | null;

export type ChatSender = "Dominion" | "Client";

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  at: string; // ISO timestamp
}

export interface RequestForInfo {
  id: string;
  text: string;
  createdAt: string;
  resolved: boolean;
  messages: ChatMessage[];
}

export type DataSourceKind =
  | "OnboardingForm"
  | "CARM"
  | "BrokerRecords"
  | "CADReport"
  | "ImportData"
  | "Other";

export type DataSourceStatus = "Requested" | "Received" | "Validated";

export interface DataSource {
  id: string;
  label: string;
  kind: DataSourceKind;
  status: DataSourceStatus;
}

export interface ActivityLogEntry {
  id: string;
  at: string; // ISO timestamp
  message: string;
}

/** Proof of work — records that a stage was completed, by whom and when. */
export interface StageCompletion {
  id: string;
  stage: Stage;
  by: string; // user name who completed it
  at: string; // ISO timestamp
}

export interface Onboarding {
  id: string;
  clientId: string; // linked ClientProfile id
  serviceType: ServiceType;
  stage: Stage;

  // A4.1 — system assigns onboarding form
  formAssigned: boolean;

  // A4.3 / A4.4 / A4.5 — CARM sub-branch (only for CARM-required service types)
  carmPortalAccessRequested: boolean;
  carmDelegationCorrect: boolean;
  carmCadReportRequested: boolean;

  // A4.3 / A4.4 — data collection checklist (seeded per service type)
  checklist: ChecklistItem[];

  // A4.8 — Data Collection Process L3 sub-flow state
  dcStep: DcStep; // current A4.8 position
  dcAnswers: DcAnswers; // decision answers (integrationRequired, customTemplate, …)
  dcLibrary: string[]; // A4.8.9 documents added to the DCC Library
  dcOutcome: "" | "ToA4_2" | "ToB4"; // A4.8.14 resolved exit route (tracked, not navigated)

  // A4.5 / A4.6 — reviewer gate
  reviewDecision: ReviewDecision;
  // A4.7 — requests for information
  requests: RequestForInfo[];

  // A4.9 / A4.10 — trade chain partner (broker) access
  tradeChainAccessRequired: boolean;
  tradeChainAccessProvided: boolean;
  // A4.11 — additional data sources
  additionalDataSources: boolean;
  dataSources: DataSource[];

  // A4.12 — operational team
  assignedEmployees: string[];
  // A4.14 — kick-off meeting
  kickoffDate: string;

  // A4.13 — activity log
  activityLog: ActivityLogEntry[];
  // Proof of work — completed-stage records (who/when)
  stageCompletions: StageCompletion[];

  uploadedFiles: string[];
  // Per-stage proof documents (filenames), keyed by the stage they were uploaded for.
  stageProofs: Partial<Record<Stage, string[]>>;
  notes: string;
}

export type OnboardingInput = Omit<Onboarding, "id">;

// ── Helpers ────────────────────────────────────────────────────────
const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.floor(Math.random() * 1e9).toString(36)}`;

const today = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const mkLog = (message: string): ActivityLogEntry => ({ id: genId(), at: nowIso(), message });

/**
 * A4.1 — a blank onboarding seeded with the chosen service type and its checklist.
 * The service type and checklist come from master data (MastersContext), so callers
 * pass them in rather than this module hardcoding them.
 */
export const emptyOnboarding = (
  serviceType: ServiceType = "",
  checklist: ChecklistItem[] = [],
): OnboardingInput => ({
  clientId: "",
  serviceType,
  stage: "FormAssigned",
  formAssigned: true,
  carmPortalAccessRequested: false,
  carmDelegationCorrect: false,
  carmCadReportRequested: false,
  checklist,
  dcStep: "Review",
  dcAnswers: {},
  dcLibrary: [],
  dcOutcome: "",
  reviewDecision: null,
  requests: [],
  tradeChainAccessRequired: false,
  tradeChainAccessProvided: false,
  additionalDataSources: false,
  dataSources: [],
  assignedEmployees: [],
  kickoffDate: addDays(14),
  activityLog: [mkLog("Client Onboarding Form assigned to client.")],
  stageCompletions: [],
  uploadedFiles: [],
  stageProofs: {},
  notes: "",
});

export const emptyRequest = (): RequestForInfo => ({
  id: genId(),
  text: "",
  createdAt: today(),
  resolved: false,
  messages: [],
});

export const newChatMessage = (sender: ChatSender, text: string): ChatMessage => ({
  id: genId(),
  sender,
  text,
  at: nowIso(),
});

export const emptyDataSource = (kind: DataSourceKind = "Other"): DataSource => ({
  id: genId(),
  label: "",
  kind,
  status: "Requested",
});

// ── Context ────────────────────────────────────────────────────────
interface OnboardingContextType {
  onboardings: Onboarding[];
  addOnboarding: (input: OnboardingInput) => Onboarding;
  updateOnboarding: (id: string, input: OnboardingInput) => void;
  deleteOnboarding: (id: string) => void;
  /** Append an activity-log entry (A4.13). */
  logActivity: (id: string, message: string) => void;
  /** Attach proof document filenames to a stage, logging the upload. */
  addStageProof: (id: string, stage: Stage, filenames: string[]) => void;
  /**
   * Move to a stage, recording the transition in the activity log. Passing `by`
   * also files a proof-of-work record for the stage being completed (left).
   */
  setStage: (id: string, stage: Stage, by?: string) => void;
  /**
   * Record an A4.8 decision/flag answer and advance the sub-flow to the next step,
   * logging the transition. `by` is currently unused but kept for parity with setStage.
   */
  advanceDcStep: (id: string, answer?: { key: string; value: boolean }) => void;
  /** Jump the A4.8 sub-flow to a specific step to review or edit it (logs the move). */
  setDcStep: (id: string, step: DcStep) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);
const STORAGE_KEY = "ccos_onboarding";

const seedState = (): Onboarding[] => [];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardings, setOnboardings] = useState<Onboarding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as Onboarding[];
      } catch (e) {
        console.error("Failed to parse onboardings", e);
      }
    }
    return seedState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardings));
  }, [onboardings]);

  const addOnboarding: OnboardingContextType["addOnboarding"] = (input) => {
    const created: Onboarding = { ...input, id: genId() };
    setOnboardings((o) => [...o, created]);
    return created;
  };

  const updateOnboarding: OnboardingContextType["updateOnboarding"] = (id, input) => {
    setOnboardings((o) => o.map((x) => (x.id === id ? { ...input, id } : x)));
  };

  const deleteOnboarding: OnboardingContextType["deleteOnboarding"] = (id) => {
    setOnboardings((o) => o.filter((x) => x.id !== id));
  };

  const logActivity: OnboardingContextType["logActivity"] = (id, message) => {
    setOnboardings((o) =>
      o.map((x) => (x.id === id ? { ...x, activityLog: [...x.activityLog, mkLog(message)] } : x)),
    );
  };

  const addStageProof: OnboardingContextType["addStageProof"] = (id, stage, filenames) => {
    if (filenames.length === 0) return;
    setOnboardings((o) =>
      o.map((x) => {
        if (x.id !== id) return x;
        const existing = (x.stageProofs ?? {})[stage] ?? [];
        return {
          ...x,
          stageProofs: { ...(x.stageProofs ?? {}), [stage]: [...existing, ...filenames] },
          activityLog: [
            ...x.activityLog,
            mkLog(
              `Proof uploaded for ${stageLabels[stage]} — ${filenames.length} document(s): ${filenames.join(", ")}.`,
            ),
          ],
        };
      }),
    );
  };

  const setStage: OnboardingContextType["setStage"] = (id, stage, by) => {
    setOnboardings((o) =>
      o.map((x) => {
        if (x.id !== id || x.stage === stage) return x;
        const completion: StageCompletion = {
          id: genId(),
          stage: x.stage, // the stage being left is the one just completed
          by: by ?? "",
          at: nowIso(),
        };
        return {
          ...x,
          stage,
          stageCompletions: [...(x.stageCompletions ?? []), completion],
          activityLog: [
            ...x.activityLog,
            mkLog(`Stage changed to "${stageLabels[stage]}"${by ? ` by ${by}` : ""}.`),
          ],
        };
      }),
    );
  };

  const advanceDcStep: OnboardingContextType["advanceDcStep"] = (id, answer) => {
    setOnboardings((o) =>
      o.map((x) => {
        if (x.id !== id) return x;
        const answers: DcAnswers = answer
          ? { ...(x.dcAnswers ?? {}), [answer.key]: answer.value }
          : (x.dcAnswers ?? {});
        const from = x.dcStep ?? "Review";
        const to = nextDcStep(from, answers) ?? from;
        // If a decision routed us backward (e.g. CbsaReview "No" → CbsaRequest), clear
        // the just-set answer so the decision is asked fresh when we return to it.
        let finalAnswers = answers;
        if (answer && dcStepOrder.indexOf(to) < dcStepOrder.indexOf(from)) {
          finalAnswers = { ...answers };
          delete finalAnswers[answer.key];
        }
        const log: ActivityLogEntry[] = [];
        if (answer) {
          log.push(mkLog(`Data Collection — "${dcStepLabels[from]}": ${answer.value ? "Yes" : "No"}.`));
        }
        if (to !== from) {
          log.push(mkLog(`Data Collection advanced to "${dcStepLabels[to]}".`));
        }
        return {
          ...x,
          dcAnswers: finalAnswers,
          dcStep: to,
          activityLog: [...x.activityLog, ...log],
        };
      }),
    );
  };

  const setDcStep: OnboardingContextType["setDcStep"] = (id, step) => {
    setOnboardings((o) =>
      o.map((x) => {
        if (x.id !== id || (x.dcStep ?? "Review") === step) return x;
        return {
          ...x,
          dcStep: step,
          activityLog: [...x.activityLog, mkLog(`Data Collection — returned to "${dcStepLabels[step]}" to review/edit.`)],
        };
      }),
    );
  };

  return (
    <OnboardingContext.Provider
      value={{ onboardings, addOnboarding, updateOnboarding, deleteOnboarding, logActivity, addStageProof, setStage, advanceDcStep, setDcStep }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardings = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboardings must be used within an OnboardingProvider");
  return ctx;
};
