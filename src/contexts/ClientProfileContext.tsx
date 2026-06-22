import React, { createContext, useContext, useState, useEffect } from "react";

export interface DivisionContact {
  name: string;
  email: string;
  phone: string;
}

export interface RmExtension {
  sbrnNumber: string;
  description: string;
  contacts: DivisionContact[];
}

export interface ClientContact {
  name: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface ClientProfile {
  id: string;
  // Company
  companyName: string;
  businessNumber: string; // BN9 — 9 digits
  // Contact
  address: string;
  contacts: ClientContact[];
  // Billing
  mailingAddress: string;
  billingSameAsMailing: boolean;
  billingAddress: string;
  // RM Extensions
  rmExtensions: RmExtension[];
}

export type ClientProfileInput = Omit<ClientProfile, "id">;

interface ClientProfileContextType {
  profiles: ClientProfile[];
  addProfile: (profile: ClientProfileInput) => ClientProfile;
  updateProfile: (id: string, profile: ClientProfileInput) => void;
  deleteProfile: (id: string) => void;
}

const ClientProfileContext = createContext<ClientProfileContextType | undefined>(undefined);

const STORAGE_KEY = "ccos_client_profiles";

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.floor(Math.random() * 1e9).toString(36)}`;

export const emptyDivisionContact = (): DivisionContact => ({ name: "", email: "", phone: "" });

export const emptyClientContact = (isPrimary = false): ClientContact => ({
  name: "",
  phone: "",
  email: "",
  isPrimary,
});

export const emptyRmExtension = (): RmExtension => ({ sbrnNumber: "", description: "", contacts: [] });

const seedState = (): ClientProfile[] => [
  {
    id: "cp-tts",
    companyName: "Toronto Tech Solutions",
    businessNumber: "123456789",
    address: "123 Trade St, Toronto, ON M5V 2T6",
    contacts: [
      { name: "John Smith", phone: "+1 (416) 555-0123", email: "john@torontotech.ca", isPrimary: true },
    ],
    mailingAddress: "123 Trade St, Toronto, ON M5V 2T6",
    billingSameAsMailing: true,
    billingAddress: "123 Trade St, Toronto, ON M5V 2T6",
    rmExtensions: [],
  },
];

/** Upgrade a stored profile from the legacy primary/secondary contact fields to the contacts array. */
const migrateProfile = (p: ClientProfile & Record<string, unknown>): ClientProfile => {
  if (Array.isArray(p.contacts)) {
    return { ...p, contacts: p.contacts, rmExtensions: p.rmExtensions ?? [] };
  }
  const legacy: ClientContact[] = [];
  if (p.primaryContactName || p.primaryContactPhone || p.primaryContactEmail) {
    legacy.push({
      name: (p.primaryContactName as string) ?? "",
      phone: (p.primaryContactPhone as string) ?? "",
      email: (p.primaryContactEmail as string) ?? "",
      isPrimary: true,
    });
  }
  if (p.secondaryContactName || p.secondaryContactPhone || p.secondaryContactEmail) {
    legacy.push({
      name: (p.secondaryContactName as string) ?? "",
      phone: (p.secondaryContactPhone as string) ?? "",
      email: (p.secondaryContactEmail as string) ?? "",
      isPrimary: legacy.length === 0,
    });
  }
  if (legacy.length === 0) legacy.push(emptyClientContact(true));
  return { ...p, contacts: legacy, rmExtensions: p.rmExtensions ?? [] };
};

export const ClientProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return (JSON.parse(saved) as ClientProfile[]).map(migrateProfile);
      } catch (e) {
        console.error("Failed to parse client profiles", e);
      }
    }
    return seedState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const addProfile: ClientProfileContextType["addProfile"] = (profile) => {
    const created: ClientProfile = { ...profile, id: genId() };
    setProfiles((p) => [...p, created]);
    return created;
  };

  const updateProfile: ClientProfileContextType["updateProfile"] = (id, profile) => {
    setProfiles((p) => p.map((x) => (x.id === id ? { ...profile, id } : x)));
  };

  const deleteProfile: ClientProfileContextType["deleteProfile"] = (id) => {
    setProfiles((p) => p.filter((x) => x.id !== id));
  };

  return (
    <ClientProfileContext.Provider value={{ profiles, addProfile, updateProfile, deleteProfile }}>
      {children}
    </ClientProfileContext.Provider>
  );
};

export const useClientProfiles = () => {
  const ctx = useContext(ClientProfileContext);
  if (!ctx) throw new Error("useClientProfiles must be used within a ClientProfileProvider");
  return ctx;
};
