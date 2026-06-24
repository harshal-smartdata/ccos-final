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
export type ServiceType =
  | "ProjectBased" // A. Project Based Services
  | "ManagedServices" // B. Managed Services
  | "LicensingClientManaged" // C.a Client Managed Onboarding
  | "LicensingDominionSupported"; // C.b Dominion Supported Onboarding

export const serviceTypeLabels: Record<ServiceType, string> = {
  ProjectBased: "Project Based Services",
  ManagedServices: "Managed Services",
  LicensingClientManaged: "Licensing — Client Managed",
  LicensingDominionSupported: "Licensing — Dominion Supported",
};

// Stages follow the flowchart left-to-right.
export type Stage =
  | "FormAssigned" // A4.1 / A4.2
  | "DataCollection" // A4.3 / A4.4
  | "UnderReview" // A4.5 / A4.6
  | "InfoRequested" // A4.7
  | "TradeChainAccess" // A4.9 – A4.11
  | "AssignTeam" // A4.12
  | "KickOff" // A4.14
  | "Completed";

export const stageOrder: Stage[] = [
  "FormAssigned",
  "DataCollection",
  "UnderReview",
  "InfoRequested",
  "TradeChainAccess",
  "AssignTeam",
  "KickOff",
  "Completed",
];

/**
 * Linear progression of the onboarding flow. `UnderReview` is a fork resolved by
 * the reviewer decision (A4.6), so it has no automatic next stage. `InfoRequested`
 * loops back to `UnderReview` once the client responds. Returns null where there is
 * no single next stage (the review fork, and the terminal Completed stage).
 */
export const nextStage = (stage: Stage): Stage | null => {
  switch (stage) {
    case "FormAssigned":
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
  DataCollection: "Data Collection",
  UnderReview: "Under Review",
  InfoRequested: "Information Requested",
  TradeChainAccess: "Trade Chain Access",
  AssignTeam: "Assign Team",
  KickOff: "Kick-Off",
  Completed: "Completed",
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

export interface Onboarding {
  id: string;
  clientId: string; // linked ClientProfile id
  serviceType: ServiceType;
  stage: Stage;

  // A4.1 — system assigns onboarding form
  formAssigned: boolean;
  // A4.3 / A4.4 — data collection checklist (seeded per service type)
  checklist: ChecklistItem[];

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

  uploadedFiles: string[];
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

const mkChecklist = (texts: string[]): ChecklistItem[] =>
  texts.map((text) => ({ id: genId(), text, done: false }));

const mkLog = (message: string): ActivityLogEntry => ({ id: genId(), at: nowIso(), message });

/** A4.3 — service-type-specific data collection checklist (A / B / C from spec). */
export const serviceChecklistTemplate = (serviceType: ServiceType): ChecklistItem[] => {
  const projectBased = [
    "Request onboarding form",
    "Request CARM Client Portal access",
    "Import data from broker logins",
    "Historical data collection (4 years)",
    "Validate CARM delegation & visibility access",
    "Request CAD report from CBSA",
    "Confirm total import records received",
    "Upload all records to system",
    "Assign auditor",
    "Intro meeting",
    "Launch project",
  ];
  switch (serviceType) {
    case "ProjectBased":
      return mkChecklist(projectBased);
    case "ManagedServices":
      return mkChecklist([
        ...projectBased,
        "Set up re-occurring new data collection",
        "Configure system integration",
        "Enable manual upload",
        "Establish client validation feedback loop",
      ]);
    case "LicensingClientManaged":
      return mkChecklist([
        "Onboarding form",
        "Create admin profile",
        "Schedule training",
        "Activate helpdesk profile",
        "Data migration",
      ]);
    case "LicensingDominionSupported":
      return mkChecklist([
        "Onboarding form",
        "Create admin profile",
        "Schedule training",
        "Activate helpdesk profile",
        "Data migration",
        "Dominion-supported setup & configuration",
        "Dominion-led data import assistance",
      ]);
  }
};

export const emptyOnboarding = (): OnboardingInput => ({
  clientId: "",
  serviceType: "ProjectBased",
  stage: "FormAssigned",
  formAssigned: true,
  checklist: serviceChecklistTemplate("ProjectBased"),
  reviewDecision: null,
  requests: [],
  tradeChainAccessRequired: false,
  tradeChainAccessProvided: false,
  additionalDataSources: false,
  dataSources: [],
  assignedEmployees: [],
  kickoffDate: addDays(14),
  activityLog: [mkLog("Client Onboarding Form assigned to client.")],
  uploadedFiles: [],
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
  /** Move to a stage, recording the transition in the activity log. */
  setStage: (id: string, stage: Stage) => void;
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

  const setStage: OnboardingContextType["setStage"] = (id, stage) => {
    setOnboardings((o) =>
      o.map((x) =>
        x.id === id && x.stage !== stage
          ? {
              ...x,
              stage,
              activityLog: [...x.activityLog, mkLog(`Stage changed to "${stageLabels[stage]}".`)],
            }
          : x,
      ),
    );
  };

  return (
    <OnboardingContext.Provider
      value={{ onboardings, addOnboarding, updateOnboarding, deleteOnboarding, logActivity, setStage }}
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
