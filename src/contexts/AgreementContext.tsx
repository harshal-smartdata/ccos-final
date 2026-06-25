import React, { createContext, useContext, useState, useEffect } from "react";

// ── Reps (static seed) ─────────────────────────────────────────────
export const salesReps = ["Sarah Chen", "James Wilson", "Lisa Park", "Michael Torres"];
export const workManagementReps = ["James Wilson", "Lisa Park", "Sarah Chen", "Priya Nair"];

// ── Project service types ──────────────────────────────────────────
export const SERVICE_TYPES = [
  "Duty Recovery",
  "Compliance Services",
  "CCOS License",
  "Advisory",
  "Other",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

// ── Supporting types ───────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface AuditAllocation {
  hourlyRate?: number;
  allocatedHours?: number;
}

export type AgreementType =
  | "Annual Agreement"
  | "One-time Declaration"
  | "Specific Shipment Agreement"
  | "Master Service Agreement";

export type Currency = "USD" | "CAD";
export type BillingStatus = "Active" | "Draft" | "Exhausted" | "Closed";
export type BillingKind =
  | "fixed_price"
  | "bundled_hours"
  | "tiered"
  | "retainer"
  | "milestone";

export type FixedPriceBillingType = "Hourly" | "Percentage" | "Project" | "Priority";
export type TieredBillingType = "Accumulated" | "LineLevel";

export interface AccumulatedTier {
  id: string;
  percentage: number;
  from: number;
  to: number | null; // null = "Unlimited"
}
export interface LineLevelTier {
  id: string;
  percentage: number;
  threshold: number;
}
export interface Milestone {
  id: string;
  label: string;
  valueType: "Percent" | "Amount";
  value: number;
}

// A dated project milestone (distinct from billing milestones above).
export interface ProjectMilestone {
  id: string;
  label: string;
  date: string;
}

// One billing model. Fields are shared + per-kind (optional).
export interface BillingModel {
  id: string;
  kind: BillingKind;
  // shared
  label: string;
  currency: Currency;
  estHoursCount?: number;
  status: BillingStatus;
  notes: string;
  // fixed_price
  fixedPriceType?: FixedPriceBillingType;
  rate?: number;
  percentage?: number;
  amount?: number;
  hoursCount?: number;
  // bundled_hours
  btbCount?: number;
  hoursPerBtb?: number;
  ratePerHour?: number;
  purchasedHours?: number;
  thresholdPct?: number;
  // tiered
  tieredType?: TieredBillingType;
  accumulatedTiers?: AccumulatedTier[];
  adjustmentType?: string;
  lineLevelTiers?: LineLevelTier[];
  // retainer
  cadence?: "monthly" | "quarterly" | "yearly";
  // milestone
  milestoneTemplate?: string;
  milestones?: Milestone[];
}

// ── Project / Agreement (unified) ──────────────────────────────────
export interface Project {
  id: string;
  isAgreement: boolean;
  parentId: string | null; // sub-projects point at their agreement
  clientId: string; // linked ClientProfile id

  // Agreement (§1) fields
  agreementNumber: string;
  agreementType: AgreementType;
  name: string;
  effectiveDate: string;
  expiryDate: string;
  salesRep: string;
  workManagementRep: string;
  agreementBillingModels: BillingModel[];
  agreementOverride: boolean;
  notes: string;
  agreementChecklist: ChecklistItem[];
  uploadedFiles: string[];
  declarationAccepted: boolean;

  // Project (§2) fields
  projectNumber: string; // system-generated, e.g. PR-0001
  serviceType: ServiceType;
  assignedTo: string[]; // one or more assigned auditors
  assignedDate: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  projectMilestones: ProjectMilestone[];
  clientNotes: string;
  exclusionProfile: string;
  checklist: ChecklistItem[];
  auditAllocations: Record<string, AuditAllocation>; // per-auditor rate/hours, keyed by assignedTo

  // Hidden/legacy per-project billing (set later via ProjectBillingSetupDialog)
  billingType?: string;
  billingRate?: number;
  billingEstimate?: number;
  allocatedHours?: number;
  allocatedBudget?: number;
}

export type ProjectInput = Omit<Project, "id">;

// ── Helpers ────────────────────────────────────────────────────────
const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.floor(Math.random() * 1e9).toString(36)}`;

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const emptyChecklistItem = (): ChecklistItem => ({ id: genId(), text: "", done: false });

export const emptyProjectMilestone = (): ProjectMilestone => ({ id: genId(), label: "", date: today() });

// Pure sequence generators — compute the next number from a given project list.
const computeNextAgreementNumber = (list: Project[]) => {
  const nums = list
    .filter((p) => p.isAgreement && /^AG-\d+$/.test(p.agreementNumber))
    .map((p) => parseInt(p.agreementNumber.slice(3), 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `AG-${String(next).padStart(4, "0")}`;
};

const computeNextProjectNumber = (list: Project[]) => {
  const nums = list
    .filter((p) => !p.isAgreement && /^PR-\d+$/.test(p.projectNumber))
    .map((p) => parseInt(p.projectNumber.slice(3), 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PR-${String(next).padStart(4, "0")}`;
};

export const emptyAgreement = (): ProjectInput => ({
  isAgreement: true,
  parentId: null,
  clientId: "",
  agreementNumber: "",
  agreementType: "Annual Agreement",
  name: "",
  effectiveDate: today(),
  expiryDate: addDays(365),
  salesRep: salesReps[0],
  workManagementRep: workManagementReps[0],
  agreementBillingModels: [],
  agreementOverride: false,
  notes: "",
  agreementChecklist: [],
  uploadedFiles: [],
  declarationAccepted: false,
  // project fields unused on an agreement, but keep shape consistent
  projectNumber: "",
  serviceType: SERVICE_TYPES[0],
  assignedTo: [workManagementReps[0]],
  assignedDate: today(),
  priority: "Medium",
  dueDate: addDays(30),
  projectMilestones: [],
  clientNotes: "",
  exclusionProfile: "",
  checklist: [],
  auditAllocations: {},
});

export const emptySubProject = (parentId: string): ProjectInput => ({
  ...emptyAgreement(),
  isAgreement: false,
  parentId,
  agreementNumber: "",
  name: "",
  assignedTo: [workManagementReps[0]],
  priority: "Medium",
  dueDate: addDays(30),
  checklist: [],
  auditAllocations: {},
});

export const emptyBillingModel = (kind: BillingKind): BillingModel => ({
  id: genId(),
  kind,
  label: "",
  currency: "USD",
  status: "Draft",
  notes: "",
  ...(kind === "fixed_price" && { fixedPriceType: "Hourly" as FixedPriceBillingType, rate: 0, amount: 0 }),
  ...(kind === "bundled_hours" && {
    btbCount: 1,
    hoursPerBtb: 10,
    ratePerHour: 175,
    purchasedHours: 10,
    thresholdPct: 20,
  }),
  ...(kind === "tiered" && {
    tieredType: "Accumulated" as TieredBillingType,
    accumulatedTiers: [],
    lineLevelTiers: [],
    adjustmentType: "",
  }),
  ...(kind === "retainer" && { amount: 0, hoursCount: 0, cadence: "monthly" as const }),
  ...(kind === "milestone" && { milestoneTemplate: "", milestones: [] }),
});

// ── Context ────────────────────────────────────────────────────────
interface AgreementContextType {
  projects: Project[];
  agreements: Project[];
  subProjectsOf: (agreementId: string) => Project[];
  addProject: (input: ProjectInput) => Project;
  updateProject: (id: string, input: ProjectInput) => void;
  deleteProject: (id: string) => void;
  nextAgreementNumber: () => string;
  nextProjectNumber: () => string;
}

const AgreementContext = createContext<AgreementContextType | undefined>(undefined);
const STORAGE_KEY = "ccos_agreements";

const seedState = (): Project[] => [];

export const AgreementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as Project[];
      } catch (e) {
        console.error("Failed to parse agreements", e);
      }
    }
    return seedState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const nextAgreementNumber = () => computeNextAgreementNumber(projects);
  const nextProjectNumber = () => computeNextProjectNumber(projects);

  const addProject: AgreementContextType["addProject"] = (input) => {
    const id = genId();
    let created: Project = { ...input, id };
    // Compute numbers off the freshest list so batch adds get sequential numbers.
    setProjects((prev) => {
      const agreementNumber =
        input.isAgreement && !input.agreementNumber ? computeNextAgreementNumber(prev) : input.agreementNumber;
      const projectNumber =
        !input.isAgreement && !input.projectNumber ? computeNextProjectNumber(prev) : input.projectNumber;
      created = { ...input, agreementNumber, projectNumber, id };
      return [...prev, created];
    });
    return created;
  };

  const updateProject: AgreementContextType["updateProject"] = (id, input) => {
    setProjects((p) => p.map((x) => (x.id === id ? { ...input, id } : x)));
  };

  const deleteProject: AgreementContextType["deleteProject"] = (id) => {
    setProjects((p) => p.filter((x) => x.id !== id && x.parentId !== id));
  };

  const agreements = projects.filter((p) => p.isAgreement);
  const subProjectsOf = (agreementId: string) =>
    projects.filter((p) => !p.isAgreement && p.parentId === agreementId);

  return (
    <AgreementContext.Provider
      value={{
        projects,
        agreements,
        subProjectsOf,
        addProject,
        updateProject,
        deleteProject,
        nextAgreementNumber,
        nextProjectNumber,
      }}
    >
      {children}
    </AgreementContext.Provider>
  );
};

export const useAgreements = () => {
  const ctx = useContext(AgreementContext);
  if (!ctx) throw new Error("useAgreements must be used within an AgreementProvider");
  return ctx;
};
