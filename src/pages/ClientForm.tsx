import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import BulkUploadPanel from "@/components/shared/BulkUploadPanel";
import { ArrowLeft, Save, UserPlus, Upload } from "lucide-react";

const billingTypes = ["Fixed", "Hourly", "Percentage", "Hybrid"];

const templateColumns = ["Business Name", "Business Number", "Contact Name", "Contact Email", "Phone", "Billing Type", "Billing Rate", "Address"];
const sampleRows = [
  ["Toronto Tech Solutions (TTS-001)", "BN-123456789", "John Smith", "john@torontotech.ca", "+1 416 555 0123", "Fixed", "250.00", "123 Trade St, Toronto"],
  ["Vancouver Logistics Ltd. (VLL-002)", "BN-987654321", "Jane Doe", "jane@vancouverlogistics.ca", "+1 604 555 0456", "Hourly", "175.00", "456 Port Ave, Vancouver"],
];

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [mode, setMode] = useState<"choose" | "manual" | "bulk">(isEdit ? "manual" : "choose");

  const [form, setForm] = useState({
    business_name: isEdit ? "Toronto Tech Solutions (TTS-001)" : "",
    business_number: isEdit ? "BN-123456789" : "",
    contact_name: isEdit ? "John Smith" : "",
    contact_email: isEdit ? "john@torontotech.ca" : "",
    contact_phone: isEdit ? "+1 (416) 555-0123" : "",
    billing_type: isEdit ? "Fixed" : "Fixed",
    billing_rate: isEdit ? "250.00" : "",
    address: isEdit ? "123 Trade St, Toronto, ON M5V 2T6" : "",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="w-full mx-auto flex flex-col gap-4">
      {/* Mode selector */}
      {mode === "choose" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0 mt-4">
          <button onClick={() => setMode("manual")} className="bg-card rounded-xl border shadow-sm p-8 text-center hover:border-primary hover:shadow-md transition-all group">
            <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <h3 className="text-base font-semibold mb-1">Manual Entry</h3>
            <p className="text-sm text-muted-foreground">Add a single client with a form.</p>
          </button>
          <button onClick={() => setMode("bulk")} className="bg-card rounded-xl border shadow-sm p-8 text-center hover:border-primary hover:shadow-md transition-all group">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <h3 className="text-base font-semibold mb-1">Bulk Upload</h3>
            <p className="text-sm text-muted-foreground">Import multiple clients from a CSV file.</p>
          </button>
        </div>
      )}

      {/* Bulk upload */}
      {mode === "bulk" && (
        <div className="mt-4 flex-shrink-0">
          <BulkUploadPanel entityName="Client" templateColumns={templateColumns} sampleRows={sampleRows} onBack={() => navigate("/clients")} />
        </div>
      )}

      {/* Manual form */}
      {mode === "manual" && (
        <div className="flex flex-col flex-1 min-h-0 mt-4">
          <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col">
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Business Name *</label>
                    <input value={form.business_name} onChange={(e) => update("business_name", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Enter business name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Business Number (BN)</label>
                    <input value={form.business_number} onChange={(e) => update("business_number", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="BN-XXXXXXXXX" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Contact Name *</label>
                    <input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Contact Email *</label>
                    <input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="email@company.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Phone</label>
                    <input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="+1 (XXX) XXX-XXXX" />
                  </div>
                  <div className="md:col-span-2 xl:col-span-1">
                    <label className="text-sm font-medium block mb-1.5">Address</label>
                    <input value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Street, City, Province, Postal Code" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">Billing Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Billing Type *</label>
                    <select value={form.billing_type} onChange={(e) => update("billing_type", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      {billingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Billing Rate ($)</label>
                    <input type="number" value={form.billing_rate} onChange={(e) => update("billing_rate", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5 border-b pb-2">Notes</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="w-full bg-background border rounded-lg px-3 py-2 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Internal notes about this client..." />
              </div>

            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => navigate("/clients")}>Cancel</Button>
              <Button><Save className="h-4 w-4 mr-1" />{isEdit ? "Update Client" : "Create Client"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientForm;
