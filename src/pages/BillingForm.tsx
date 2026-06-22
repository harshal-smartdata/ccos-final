import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

const invoiceStatuses = ["Draft", "Sent", "Paid", "Partially Paid", "Overdue", "Cancelled"];

const BillingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    client_id: isEdit ? "Toronto Tech Solutions (TTS-001)" : "",
    linked_type: isEdit ? "CAD" : "",
    linked_id: isEdit ? "CAD-2024-0891" : "",
    fee_billed: isEdit ? "2150.00" : "",
    fee_collected: isEdit ? "2150.00" : "",
    outstanding: isEdit ? "0.00" : "",
    invoice_date: isEdit ? "2026-04-14" : "",
    payment_due_date: isEdit ? "2026-05-14" : "",
    payment_received_date: isEdit ? "2026-04-14" : "",
    invoice_status: isEdit ? "Paid" : "Draft",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-3xl">


      <PageHeader
        title={isEdit ? "Edit Invoice" : "Create Invoice"}
        description={isEdit ? "Update invoice details." : "Create a new invoice."}
      />

      <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Client *</label>
              <select value={form.client_id} onChange={(e) => update("client_id", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Select client</option>
                <option value="Toronto Tech Solutions (TTS-001)">Toronto Tech Solutions (TTS-001)</option>
                <option value="Vancouver Logistics Ltd. (VLL-002)">Vancouver Logistics Ltd. (VLL-002)</option>
                <option value="Montreal Wholesale Inc. (MWI-003)">Montreal Wholesale Inc. (MWI-003)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Invoice Status</label>
              <select value={form.invoice_status} onChange={(e) => update("invoice_status", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                {invoiceStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Linked Entity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Type</label>
              <select value={form.linked_type} onChange={(e) => update("linked_type", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">None</option>
                <option value="CAD">CAD</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Reference ID</label>
              <input value={form.linked_id} onChange={(e) => update("linked_id", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono" placeholder="e.g. CAD-2024-0891" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Amounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Fee Billed ($)</label>
              <input type="number" step="0.01" value={form.fee_billed} onChange={(e) => update("fee_billed", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Fee Collected ($)</label>
              <input type="number" step="0.01" value={form.fee_collected} onChange={(e) => update("fee_collected", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Outstanding ($)</label>
              <input type="number" step="0.01" value={form.outstanding} onChange={(e) => update("outstanding", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0.00" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Invoice Date</label>
              <input type="date" value={form.invoice_date} onChange={(e) => update("invoice_date", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Payment Due Date</label>
              <input type="date" value={form.payment_due_date} onChange={(e) => update("payment_due_date", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Payment Received</label>
              <input type="date" value={form.payment_received_date} onChange={(e) => update("payment_received_date", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Invoice notes..." />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" onClick={() => navigate("/billing")}>Cancel</Button>
          <Button><Save className="h-4 w-4 mr-1" />{isEdit ? "Update Invoice" : "Create Invoice"}</Button>
        </div>
      </div>
    </div>
  );
};

export default BillingForm;
