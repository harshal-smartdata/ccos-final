import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Pencil, Trash2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ListShell, RowActions, ScreenHeader, BulkActions, PAGE_SIZE } from "@/components/user-management/ListShell";
import BulkUploadPanel from "@/components/shared/BulkUploadPanel";
import {
  useClientProfiles,
  emptyRmExtension,
  emptyDivisionContact,
  emptyClientContact,
  type ClientProfileInput,
  type RmExtension,
  type DivisionContact,
  type ClientContact,
} from "@/contexts/ClientProfileContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

// The primary contact (or the first, or an empty fallback) for a profile.
const primaryContactOf = (p: { contacts?: ClientContact[] }): ClientContact => {
  const contacts = p.contacts ?? [];
  return contacts.find((c) => c.isPrimary) ?? contacts[0] ?? emptyClientContact();
};

const emptyForm: ClientProfileInput = {
  companyName: "",
  businessNumber: "",
  address: "",
  contacts: [emptyClientContact(true)],
  mailingAddress: "",
  billingSameAsMailing: false,
  billingAddress: "",
  rmExtensions: [],
};

const templateColumns = [
  "Company Name",
  "Business Number (BN9)",
  "Address",
  "Primary Contact Name",
  "Primary Contact Phone",
  "Primary Contact Email",
  "Secondary Contact Name",
  "Secondary Contact Phone",
  "Secondary Contact Email",
  "Mailing Address",
  "Billing Address",
];
const sampleRows = [
  [
    "Toronto Tech Solutions",
    "123456789",
    "123 Trade St, Toronto, ON M5V 2T6",
    "John Smith",
    "+1 (416) 555-0123",
    "john@torontotech.ca",
    "",
    "",
    "",
    "123 Trade St, Toronto, ON M5V 2T6",
    "123 Trade St, Toronto, ON M5V 2T6",
  ],
  [
    "Vancouver Logistics Ltd.",
    "987654321",
    "456 Port Ave, Vancouver, BC V6B 1A1",
    "Jane Doe",
    "+1 (604) 555-0456",
    "jane@vancouverlogistics.ca",
    "Mark Lee",
    "+1 (604) 555-0789",
    "mark@vancouverlogistics.ca",
    "PO Box 12, Vancouver, BC V6B 1A1",
    "PO Box 12, Vancouver, BC V6B 1A1",
  ],
];

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">{children}</h3>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) => (
  <div className={className}>
    <label className="text-sm font-medium block mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={FIELD}
      placeholder={placeholder}
    />
  </div>
);

const ClientProfilesPage = () => {
  const { profiles, addProfile, updateProfile, deleteProfile } = useClientProfiles();
  const { toast } = useToast();
  const [mode, setMode] = useState<"list" | "form" | "bulk">("list");
  const [form, setForm] = useState<ClientProfileInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const update = <K extends keyof ClientProfileInput>(key: K, value: ClientProfileInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateContactField = (index: number, key: keyof Omit<ClientContact, "isPrimary">, value: string) =>
    setForm((f) => ({
      ...f,
      contacts: f.contacts.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    }));

  const addContactRow = () =>
    setForm((f) => ({
      ...f,
      contacts: [...f.contacts, emptyClientContact(f.contacts.length === 0)],
    }));

  const setPrimaryContact = (index: number) =>
    setForm((f) => ({
      ...f,
      contacts: f.contacts.map((c, i) => ({ ...c, isPrimary: i === index })),
    }));

  const removeContactRow = (index: number) =>
    setForm((f) => {
      const removedPrimary = f.contacts[index]?.isPrimary;
      const contacts = f.contacts.filter((_, i) => i !== index);
      // Keep a primary selected if the removed row was primary.
      if (removedPrimary && contacts.length > 0 && !contacts.some((c) => c.isPrimary)) {
        contacts[0] = { ...contacts[0], isPrimary: true };
      }
      return { ...f, contacts };
    });

  const updateExtension = (index: number, key: keyof Omit<RmExtension, "contacts">, value: string) =>
    setForm((f) => ({
      ...f,
      rmExtensions: f.rmExtensions.map((ext, i) => (i === index ? { ...ext, [key]: value } : ext)),
    }));

  const addExtension = () =>
    setForm((f) => ({ ...f, rmExtensions: [...f.rmExtensions, emptyRmExtension()] }));

  const removeExtension = (index: number) =>
    setForm((f) => ({ ...f, rmExtensions: f.rmExtensions.filter((_, i) => i !== index) }));

  const addContact = (extIndex: number) =>
    setForm((f) => ({
      ...f,
      rmExtensions: f.rmExtensions.map((ext, i) =>
        i === extIndex ? { ...ext, contacts: [...ext.contacts, emptyDivisionContact()] } : ext
      ),
    }));

  const updateContact = (
    extIndex: number,
    contactIndex: number,
    key: keyof DivisionContact,
    value: string
  ) =>
    setForm((f) => ({
      ...f,
      rmExtensions: f.rmExtensions.map((ext, i) =>
        i === extIndex
          ? {
              ...ext,
              contacts: ext.contacts.map((c, ci) => (ci === contactIndex ? { ...c, [key]: value } : c)),
            }
          : ext
      ),
    }));

  const removeContact = (extIndex: number, contactIndex: number) =>
    setForm((f) => ({
      ...f,
      rmExtensions: f.rmExtensions.map((ext, i) =>
        i === extIndex ? { ...ext, contacts: ext.contacts.filter((_, ci) => ci !== contactIndex) } : ext
      ),
    }));

  // Keep billing address mirrored to mailing while the copy box is checked.
  const toggleBillingSame = (checked: boolean) =>
    setForm((f) => ({
      ...f,
      billingSameAsMailing: checked,
      billingAddress: checked ? f.mailingAddress : f.billingAddress,
    }));

  const setMailingAddress = (value: string) =>
    setForm((f) => ({
      ...f,
      mailingAddress: value,
      billingAddress: f.billingSameAsMailing ? value : f.billingAddress,
    }));

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("form");
  };

  const openEdit = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    const { id: _omit, ...rest } = p;
    setForm(rest);
    setEditingId(id);
    setMode("form");
  };

  const backToList = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("list");
  };

  const handleSubmit = () => {
    if (!form.companyName.trim()) {
      toast({ title: "Missing required field", description: "Company Name is required." });
      return;
    }
    if (!/^\d{9}$/.test(form.businessNumber.trim())) {
      toast({
        title: "Invalid Business Number",
        description: "Business Number (BN9) must be exactly 9 digits.",
      });
      return;
    }

    const payload: ClientProfileInput = {
      ...form,
      companyName: form.companyName.trim(),
      businessNumber: form.businessNumber.trim(),
      billingAddress: form.billingSameAsMailing ? form.mailingAddress : form.billingAddress,
    };

    if (editingId) {
      updateProfile(editingId, payload);
      toast({ title: "Profile updated", description: `${payload.companyName} has been updated.` });
    } else {
      addProfile(payload);
      toast({ title: "Profile created", description: `${payload.companyName} has been added.` });
    }
    backToList();
  };

  const filtered = useMemo(
    () =>
      profiles.filter(
        (p) =>
          p.companyName.toLowerCase().includes(search.toLowerCase()) ||
          p.businessNumber.includes(search.trim()) ||
          primaryContactOf(p).name.toLowerCase().includes(search.toLowerCase())
      ),
    [profiles, search]
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (mode === "bulk") {
    return (
      <div className="max-w-6xl mx-auto w-full pb-8">
        <ScreenHeader onBack={backToList} trail={["Client Profiles", "Bulk Upload"]} />
        <BulkUploadPanel
          entityName="Client Profile"
          templateColumns={templateColumns}
          sampleRows={sampleRows}
          onBack={backToList}
        />
      </div>
    );
  }

  if (mode === "form") {
    return (
      <div className="max-w-6xl mx-auto w-full pb-8">
        <ScreenHeader
          onBack={backToList}
          trail={["Client Profiles", editingId ? "Edit Profile" : "New Profile"]}
        />
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="space-y-8">
            {/* Company */}
            <div>
              <SectionHeading>Company</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Field
                  label="Company Name *"
                  value={form.companyName}
                  onChange={(v) => update("companyName", v)}
                  placeholder="Enter company name"
                />
                <div>
                  <label className="text-sm font-medium block mb-1.5">Business Number (BN9) *</label>
                  <input
                    value={form.businessNumber}
                    onChange={(e) =>
                      update("businessNumber", e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    className={FIELD}
                    placeholder="9-digit number"
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Must be exactly 9 digits.</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <SectionHeading>Contact</SectionHeading>
              <div className="space-y-6">
                <Field
                  label="Address"
                  value={form.address}
                  onChange={(v) => update("address", v)}
                  placeholder="Street, City, Province, Postal Code"
                />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                      Contacts <span className="text-muted-foreground">— select one as primary</span>
                    </label>
                    <Button variant="outline" size="sm" onClick={addContactRow}>
                      <Plus className="h-4 w-4 mr-1" /> Add Contact
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {form.contacts.map((c, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg p-4 ${
                          c.isPrimary ? "border-primary/50 bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                            <input
                              type="radio"
                              name="primaryContact"
                              checked={c.isPrimary}
                              onChange={() => setPrimaryContact(i)}
                              className="h-4 w-4 accent-primary"
                            />
                            {c.isPrimary ? "Primary Contact" : "Set as Primary"}
                          </label>
                          {form.contacts.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeContactRow(i)}
                              title="Remove contact"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Field
                            label="Contact Name"
                            value={c.name}
                            onChange={(v) => updateContactField(i, "name", v)}
                            placeholder="Full name"
                          />
                          <Field
                            label="Contact Phone"
                            value={c.phone}
                            onChange={(v) => updateContactField(i, "phone", v)}
                            placeholder="+1 (XXX) XXX-XXXX"
                          />
                          <Field
                            label="Contact Email"
                            type="email"
                            value={c.email}
                            onChange={(v) => updateContactField(i, "email", v)}
                            placeholder="email@company.com"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div>
              <SectionHeading>Billing</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  label="Shipping Address"
                  value={form.mailingAddress}
                  onChange={setMailingAddress}
                  placeholder="Street, City, Province, Postal Code"
                />
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium">Billing Address</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.billingSameAsMailing}
                        onChange={(e) => toggleBillingSame(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-input"
                      />
                      Same as Shipping
                    </label>
                  </div>
                  <input
                    value={form.billingSameAsMailing ? form.mailingAddress : form.billingAddress}
                    onChange={(e) => update("billingAddress", e.target.value)}
                    disabled={form.billingSameAsMailing}
                    className={`${FIELD} disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder="Street, City, Province, Postal Code"
                  />
                </div>
              </div>
            </div>

            {/* RM Extensions */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-sm font-semibold text-foreground">RM Extensions</h3>
                <Button variant="outline" size="sm" onClick={addExtension}>
                  <Plus className="h-4 w-4 mr-1" /> Add Extension
                </Button>
              </div>
              {form.rmExtensions.length === 0 ? (
                <div className="flex items-center min-h-[2.5rem] bg-secondary/40 border rounded-lg px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    No extensions added. Use "Add Extension" to include one or more.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.rmExtensions.map((ext, i) => (
                    <div key={i} className="border rounded-lg p-4 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">SBRN Record {i + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeExtension(i)}
                          title="Remove SBRN record"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                          label="SBRN Number *"
                          value={ext.sbrnNumber}
                          onChange={(v) => updateExtension(i, "sbrnNumber", v)}
                          placeholder="e.g. SBRN-12345-AB"
                        />
                        <Field
                          label="Description / Branch Name"
                          value={ext.description}
                          onChange={(v) => updateExtension(i, "description", v)}
                          placeholder="e.g. Toronto Distribution Hub"
                        />
                      </div>

                      {/* Division-level Contacts */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Division-level Contacts ({ext.contacts.length})
                          </span>
                          <Button variant="outline" size="sm" onClick={() => addContact(i)}>
                            <Plus className="h-4 w-4 mr-1" /> Add Contact
                          </Button>
                        </div>
                        {ext.contacts.length === 0 ? (
                          <div className="flex items-center min-h-[2.5rem] bg-secondary/40 border rounded-lg px-3 py-2">
                            <span className="text-sm text-muted-foreground">
                              No SBRN-level contacts assigned. Global contacts will be used for notifications.
                            </span>
                          </div>
                        ) : (
                          <div className="border rounded-lg overflow-x-auto">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th className="w-10">#</th>
                                  <th>Contact Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th className="!text-center w-16">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ext.contacts.map((c, ci) => (
                                  <tr key={ci}>
                                    <td className="text-muted-foreground">{ci + 1}</td>
                                    <td>
                                      <input
                                        value={c.name}
                                        onChange={(e) => updateContact(i, ci, "name", e.target.value)}
                                        className={FIELD}
                                        placeholder="Full name"
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="email"
                                        value={c.email}
                                        onChange={(e) => updateContact(i, ci, "email", e.target.value)}
                                        className={FIELD}
                                        placeholder="email@company.com"
                                      />
                                    </td>
                                    <td>
                                      <input
                                        value={c.phone}
                                        onChange={(e) => updateContact(i, ci, "phone", e.target.value)}
                                        className={FIELD}
                                        placeholder="+1 (XXX) XXX-XXXX"
                                      />
                                    </td>
                                    <td>
                                      <div className="flex justify-center">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-destructive hover:text-destructive"
                                          onClick={() => removeContact(i, ci)}
                                          title="Remove contact"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-8">
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

  return (
    <div className="max-w-6xl mx-auto w-full pb-8">
      <ListShell
        title="Client Profiles"
        count={filtered.length}
        addLabel="Client Profile"
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
          <BulkActions
            entityName="Client Profile"
            columns={templateColumns}
            rows={sampleRows}
            onBulkUpload={() => setMode("bulk")}
          />
        }
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Business Number</th>
              <th>Primary Contact</th>
              <th>Extensions</th>
              <th className="!text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted-foreground py-8">
                  No client profiles found.
                </td>
              </tr>
            ) : (
              paged.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.companyName}</td>
                  <td className="text-muted-foreground tabular-nums">{p.businessNumber}</td>
                  <td className="text-muted-foreground">{primaryContactOf(p).name || "—"}</td>
                  <td className="text-muted-foreground tabular-nums">{p.rmExtensions.length}</td>
                  <td>
                    <div className="flex justify-center">
                      <RowActions
                        actions={[
                          {
                            label: "Edit",
                            icon: <Pencil className="h-4 w-4" />,
                            onClick: () => openEdit(p.id),
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 className="h-4 w-4" />,
                            onClick: () => {
                              deleteProfile(p.id);
                              toast({ title: "Profile deleted", description: `${p.companyName} has been removed.` });
                            },
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

export default ClientProfilesPage;
