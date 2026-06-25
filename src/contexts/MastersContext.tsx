import React, { createContext, useContext, useState, useEffect } from "react";
import { type ChecklistItem } from "@/contexts/AgreementContext";

/**
 * Master data for the service-type → data-collection-checklist templates used when
 * a new onboarding is assigned (flowchart A4.2 / A4.3). Editing a template here only
 * affects onboardings created afterwards — in-flight onboardings keep the checklist
 * they were seeded with.
 */
export interface ServiceTemplate {
  /** Stable id — stored on each Onboarding as its `serviceType`. */
  id: string;
  label: string;
  /** Ordered checklist question texts. */
  items: string[];
}

// ── Helpers ────────────────────────────────────────────────────────
const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.floor(Math.random() * 1e9).toString(36)}`;

// ── Seed templates (ids match the original hardcoded service types so
//    onboardings created before the Masters screen still resolve) ────
const PROJECT_BASED_ITEMS = [
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

const seedTemplates = (): ServiceTemplate[] => [
  { id: "ProjectBased", label: "Project Based Services", items: [...PROJECT_BASED_ITEMS] },
  {
    id: "ManagedServices",
    label: "Managed Services",
    items: [
      ...PROJECT_BASED_ITEMS,
      "Set up re-occurring new data collection",
      "Configure system integration",
      "Enable manual upload",
      "Establish client validation feedback loop",
    ],
  },
  {
    id: "LicensingClientManaged",
    label: "Licensing — Client Managed",
    items: [
      "Onboarding form",
      "Create admin profile",
      "Schedule training",
      "Activate helpdesk profile",
      "Data migration",
    ],
  },
  {
    id: "LicensingDominionSupported",
    label: "Licensing — Dominion Supported",
    items: [
      "Onboarding form",
      "Create admin profile",
      "Schedule training",
      "Activate helpdesk profile",
      "Data migration",
      "Dominion-supported setup & configuration",
      "Dominion-led data import assistance",
    ],
  },
];

// ── Context ────────────────────────────────────────────────────────
interface MastersContextType {
  serviceTemplates: ServiceTemplate[];
  /** Create a service template; returns the created record. */
  addServiceTemplate: (label: string, items?: string[]) => ServiceTemplate;
  /** Update a template's label and/or items. */
  updateServiceTemplate: (id: string, patch: Partial<Omit<ServiceTemplate, "id">>) => void;
  deleteServiceTemplate: (id: string) => void;
  /** Resolve a service-type id to its label (falls back to the id). */
  serviceTypeLabel: (id: string) => string;
  /** Build a fresh checklist (new item ids, all unchecked) from a template. */
  buildChecklist: (id: string) => ChecklistItem[];
}

const MastersContext = createContext<MastersContextType | undefined>(undefined);
const STORAGE_KEY = "ccos_masters_service_templates";

export const MastersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as ServiceTemplate[];
      } catch (e) {
        console.error("Failed to parse service templates", e);
      }
    }
    return seedTemplates();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serviceTemplates));
  }, [serviceTemplates]);

  const addServiceTemplate: MastersContextType["addServiceTemplate"] = (label, items = []) => {
    const created: ServiceTemplate = { id: genId(), label, items };
    setServiceTemplates((t) => [...t, created]);
    return created;
  };

  const updateServiceTemplate: MastersContextType["updateServiceTemplate"] = (id, patch) => {
    setServiceTemplates((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const deleteServiceTemplate: MastersContextType["deleteServiceTemplate"] = (id) => {
    setServiceTemplates((t) => t.filter((x) => x.id !== id));
  };

  const serviceTypeLabel: MastersContextType["serviceTypeLabel"] = (id) =>
    serviceTemplates.find((x) => x.id === id)?.label ?? id;

  const buildChecklist: MastersContextType["buildChecklist"] = (id) => {
    const tpl = serviceTemplates.find((x) => x.id === id);
    return (tpl?.items ?? []).map((text) => ({ id: genId(), text, done: false }));
  };

  return (
    <MastersContext.Provider
      value={{
        serviceTemplates,
        addServiceTemplate,
        updateServiceTemplate,
        deleteServiceTemplate,
        serviceTypeLabel,
        buildChecklist,
      }}
    >
      {children}
    </MastersContext.Provider>
  );
};

export const useMasters = () => {
  const ctx = useContext(MastersContext);
  if (!ctx) throw new Error("useMasters must be used within a MastersProvider");
  return ctx;
};
