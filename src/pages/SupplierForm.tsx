import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import BulkUploadPanel from "@/components/shared/BulkUploadPanel";
import { ArrowLeft, Save, UserPlus, Upload } from "lucide-react";

const countries = ["China", "Japan", "Vietnam", "Germany", "India", "South Korea", "Taiwan", "United States", "Mexico", "Italy"];
const statuses = ["Active", "Inactive"];
const customers = [
  "Toronto Tech Solutions (TTS-001)",
  "Vancouver Logistics Ltd. (VLL-002)",
  "Montreal Wholesale Inc. (MWI-003)",
  "Atlantic Freight",
  "West Coast Logistics"
];

const templateColumns = ["Supplier Name", "Country", "Address", "Contact Name", "Contact Email", "Contact Phone", "Status"];
const sampleRows = [
  ["Shanghai Metals Ltd.", "China", "88 Industrial Rd", "Wei Zhang", "wei@metals.cn", "+86 21 5555", "Active"],
  ["Tokyo Parts Co.", "Japan", "12 Shibuya Ave", "Kenji Tanaka", "kenji@tokyoparts.jp", "+81 3 1234", "Active"],
  ["Shanghai Metals Ltd.", "China", "88 Industrial Rd", "Wei Zhang", "wei@metals.cn", "+86 21 5555", "Active"],
];

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [mode, setMode] = useState<"choose" | "manual" | "bulk">(isEdit ? "manual" : "choose");

  const [form, setForm] = useState({
    supplier_name: isEdit ? "Shanghai Metals Ltd." : "",
    customer: isEdit ? "Toronto Tech Solutions (TTS-001)" : "",
    country: isEdit ? "China" : "",
    address: isEdit ? "88 Industrial Rd, Shanghai 200000" : "",
    contact_name: isEdit ? "Wei Zhang" : "",
    contact_email: isEdit ? "wei@shanghaimetals.cn" : "",
    contact_phone: isEdit ? "+86 21 5555 0123" : "",
    status: isEdit ? "Active" : "Active",
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
            <p className="text-sm text-muted-foreground">Add a single supplier with a form.</p>
          </button>
          <button onClick={() => setMode("bulk")} className="bg-card rounded-xl border shadow-sm p-8 text-center hover:border-primary hover:shadow-md transition-all group">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <h3 className="text-base font-semibold mb-1">Bulk Upload</h3>
            <p className="text-sm text-muted-foreground">Import multiple suppliers from a CSV file.</p>
          </button>
        </div>
      )}

      {/* Bulk upload */}
      {mode === "bulk" && (
        <div className="mt-4 flex-shrink-0">
          <BulkUploadPanel entityName="Supplier" templateColumns={templateColumns} sampleRows={sampleRows} onBack={() => navigate("/suppliers")} />
        </div>
      )}

      {/* Manual form */}
      {mode === "manual" && (
        <div className="flex flex-col flex-1 min-h-0 mt-4">
          <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col">
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">Supplier Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Supplier Name *</label>
                    <input value={form.supplier_name} onChange={(e) => update("supplier_name", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Enter supplier name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Customer / Client *</label>
                    <select value={form.customer} onChange={(e) => update("customer", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Select customer</option>
                      {customers.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Country *</label>
                    <select value={form.country} onChange={(e) => update("country", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Select country</option>
                      {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 xl:col-span-1">
                    <label className="text-sm font-medium block mb-1.5">Supplier Address</label>
                    <input value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Full street address, city, region, postal code" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Status</label>
                    <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Contact Name</label>
                    <input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Contact Email</label>
                    <input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="email@supplier.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Phone</label>
                    <input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="+XX XXX XXXX XXXX" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5 border-b pb-2">Notes</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="w-full bg-background border rounded-lg px-3 py-2 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Internal notes..." />
              </div>
              
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => navigate("/suppliers")}>Cancel</Button>
              <Button><Save className="h-4 w-4 mr-1" />{isEdit ? "Update Supplier" : "Create Supplier"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierForm;
