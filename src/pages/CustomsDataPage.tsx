import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import BulkUploadPanel from "@/components/shared/BulkUploadPanel";
import { Upload, FileText, UserPlus, ArrowLeft, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

const templateColumns = ["Transaction Number", "Client Code", "Supplier Name", "HS Code", "Country of Origin", "Quantity", "Unit Price", "Import Date", "Description", "Invoice Number", "Purchase Order", "Invoice Date", "Currency", "Country of Export", "Payment Terms", "US Port of Exit"];
const sampleRows = [
  ["TXN-2026-001", "Client 1", "Supplier 1", "7208.51", "China", "500", "12.50", "2026-04-01", "Hot-rolled steel coil", "INV-8273", "PO-991", "2026-03-25", "USD", "China", "Net 30", "Seattle, WA"],
];

const CustomsDataPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"choose" | "manual" | "bulk">("choose");
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem('customsRecords') || '[]');
    stored = stored.map((r: any) => {
      // Handle nested schema
      if (r.invoice) {
        return {
          ...r,
          client: r.client_id,
          supplier: r.supplier_id,
          invoice_number: r.invoice?.invoice_number || "—",
          import_date: r.import_date || r.invoice?.invoice_date || "—",
          total_value: r.total_invoice_value || 0,
          // Keep raw record for editing
          _raw: r
        };
      }
      // Backward compatibility for old flat schema
      const legacyTotal = (parseFloat(r.quantity) || 0) * (parseFloat(r.unit_price) || 0);
      return {
        ...r,
        client: (r.client || "").includes('Maple') ? 'Toronto Tech Solutions (TTS-001)' :
                (r.client || "").includes('Northern') ? 'Vancouver Logistics Ltd. (VLL-002)' : (r.client || "—"),
        supplier: r.supplier || "—",
        invoice_number: r.invoice_number || "—",
        total_value: r.total_invoice_value || legacyTotal
      };
    });
    setRecords(stored);
  }, [mode]);

  const emptyManualForm = () => ({
    transaction_number: "",
    import_date: "",
    client_id: "",
    supplier_id: "",
    vendor_address: "",
    invoice: {
      invoice_number: "",
      purchase_order: "",
      invoice_date: "",
      currency: "",
      country_of_export: "",
      payment_terms: "",
      us_port_of_exit: ""
    },
    goods: [
      {
        hs_code: "",
        country_of_origin: "",
        quantity: 0,
        unit_price: 0,
        description: "",
        line_total: 0
      }
    ],
    total_invoice_value: 0
  });

  const [manualForm, setManualForm] = useState(emptyManualForm());

  const handleEditRecord = (record: any) => {
    const raw = record._raw || record;
    if (raw.invoice) {
      setManualForm({
        ...raw,
        vendor_address: raw.vendor_address || ""
      });
    } else {
      // Compatibility for old schema
      setManualForm({
        ...emptyManualForm(),
        transaction_number: raw.transaction_number || "",
        import_date: raw.import_date || "",
        client_id: raw.client || "",
        supplier_id: raw.supplier || "",
        vendor_address: raw.vendor_address || "",
        goods: [{
          hs_code: raw.hs_code || "",
          country_of_origin: raw.country_of_origin || "",
          quantity: parseFloat(raw.quantity) || 0,
          unit_price: parseFloat(raw.unit_price) || 0,
          description: raw.description || "",
          line_total: (parseFloat(raw.quantity) || 0) * (parseFloat(raw.unit_price) || 0)
        }],
        invoice: {
          invoice_number: raw.invoice_number || "",
          purchase_order: raw.purchase_order || "",
          invoice_date: raw.invoice_date || "",
          currency: raw.currency || "",
          country_of_export: raw.country_of_export || "",
          payment_terms: raw.payment_terms || "",
          us_port_of_exit: raw.us_port_exit || ""
        },
        total_invoice_value: (parseFloat(raw.quantity) || 0) * (parseFloat(raw.unit_price) || 0)
      });
    }
    setMode("manual");
  };

  const calculateTotals = (form: any) => {
    const updatedGoods = form.goods.map((g: any) => ({
      ...g,
      line_total: (parseFloat(g.quantity) || 0) * (parseFloat(g.unit_price) || 0)
    }));
    const total = updatedGoods.reduce((sum: number, g: any) => sum + g.line_total, 0);
    return { ...form, goods: updatedGoods, total_invoice_value: total };
  };

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('customsRecords') || '[]');
    const newRecord = {
      ...manualForm,
      id: "cr-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('customsRecords', JSON.stringify([...existing, newRecord]));
    toast({ title: "Success", description: "Customs Record with Invoice imported successfully." });
    setMode("choose");
  };

  return (
    <div className="max-w-6xl w-full mx-auto flex flex-col gap-4">


      {/* Mode selector */}
      {mode === "choose" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button onClick={() => setMode("manual")} className="bg-card rounded-xl border shadow-sm p-8 text-center hover:border-primary hover:shadow-md transition-all group">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
              <h3 className="text-base font-semibold mb-1">Manual Entry</h3>
              <p className="text-sm text-muted-foreground">Enter a single customs record manually.</p>
            </button>
            <button onClick={() => setMode("bulk")} className="bg-card rounded-xl border shadow-sm p-8 text-center hover:border-primary hover:shadow-md transition-all group">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
              <h3 className="text-base font-semibold mb-1">Bulk Upload</h3>
              <p className="text-sm text-muted-foreground">Import multiple records from a CSV file.</p>
            </button>
          </div>

          {/* Recent uploads */}
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h2 className="text-sm font-semibold">Ingested Customs Records</h2>
              <span className="text-xs text-muted-foreground">{records.length} records</span>
            </div>
            {records.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No records ingested yet. Try importing bulk or manual entry.</div>
            ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Transaction #</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Invoice #</th>
                  <th className="px-5 py-3 font-medium text-right">Total Value</th>
                  <th className="px-5 py-3 font-medium text-right">Import Date</th>
                  <th className="px-5 py-3 font-medium !text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t border-border">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium font-mono text-xs">{record.transaction_number}</td>
                    <td className="px-5 py-3">{record.client}</td>
                    <td className="px-5 py-3">{record.supplier}</td>
                    <td className="px-5 py-3 text-muted-foreground">{record.invoice_number || "—"}</td>
                    <td className="px-5 py-3 font-bold text-right">${(record.total_value || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-5 py-3 text-muted-foreground text-right">{record.import_date}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleEditRecord(record)} className="text-primary hover:underline font-medium text-xs bg-primary/10 px-2 py-1.5 rounded">View & Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      )}

      {/* Manual entry form */}
      {mode === "manual" && (
        <div className="flex flex-col flex-1 min-h-0 mt-4">
          <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">Transaction Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Transaction Number *</label>
                    <input value={manualForm.transaction_number} onChange={(e) => setManualForm({...manualForm, transaction_number: e.target.value})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="TXN-XXXXXXXX-XXX" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Import Date *</label>
                    <input type="date" value={manualForm.import_date} onChange={(e) => setManualForm({...manualForm, import_date: e.target.value})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Client *</label>
                    <select value={manualForm.client_id} onChange={(e) => setManualForm({...manualForm, client_id: e.target.value})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Select client</option>
                      <option>Client 1</option>
                      <option>Client 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Supplier *</label>
                    <select value={manualForm.supplier_id} onChange={(e) => setManualForm({...manualForm, supplier_id: e.target.value})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Select supplier</option>
                      <option>Supplier 1</option>
                      <option>Supplier 2</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium block mb-1.5">Vendor Address</label>
                    <input 
                      value={manualForm.vendor_address} 
                      onChange={(e) => setManualForm({...manualForm, vendor_address: e.target.value})} 
                      className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      placeholder="Enter physical address of the vendor" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-foreground border-b pb-2">Invoice Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Invoice Number *</label>
                    <input value={manualForm.invoice.invoice_number} onChange={(e) => setManualForm({...manualForm, invoice: {...manualForm.invoice, invoice_number: e.target.value}})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="INV-XXXX" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Purchase Order</label>
                    <input value={manualForm.invoice.purchase_order} onChange={(e) => setManualForm({...manualForm, invoice: {...manualForm.invoice, purchase_order: e.target.value}})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="PO-XXXX" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Invoice Date *</label>
                    <input type="date" value={manualForm.invoice.invoice_date} onChange={(e) => setManualForm({...manualForm, invoice: {...manualForm.invoice, invoice_date: e.target.value}})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Currency *</label>
                    <select value={manualForm.invoice.currency} onChange={(e) => setManualForm({...manualForm, invoice: {...manualForm.invoice, currency: e.target.value}})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Select</option>
                      <option value="CAD - Canadian Dollar">CAD - Canadian Dollar</option>
                      <option value="USD - US Dollar">USD - US Dollar</option>
                      <option value="EUR - Euro">EUR - Euro</option>
                      <option value="GBP - British Pound">GBP - British Pound</option>
                      <option value="CNY - Chinese Yuan">CNY - Chinese Yuan</option>
                      <option value="JPY - Japanese Yen">JPY - Japanese Yen</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Payment Terms</label>
                    <input value={manualForm.invoice.payment_terms} onChange={(e) => setManualForm({...manualForm, invoice: {...manualForm.invoice, payment_terms: e.target.value}})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Net 30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Country of Export *</label>
                    <select value={manualForm.invoice.country_of_export} onChange={(e) => setManualForm({...manualForm, invoice: {...manualForm.invoice, country_of_export: e.target.value}})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Select country</option>
                      <option>China</option><option>Japan</option><option>Vietnam</option><option>Germany</option><option>India</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">US Port of Exit</label>
                    <input value={manualForm.invoice.us_port_of_exit} onChange={(e) => setManualForm({...manualForm, invoice: {...manualForm.invoice, us_port_of_exit: e.target.value}})} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 3004 - Blaine, WA" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-sm font-semibold text-foreground">Goods Information</h3>
                  <div className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Total Invoice Value: ${manualForm.total_invoice_value.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {manualForm.goods.map((good, idx) => (
                    <div key={idx} className="bg-muted/30 p-4 rounded-xl border relative">
                      {manualForm.goods.length > 1 && (
                        <button 
                          onClick={() => {
                            const newGoods = manualForm.goods.filter((_, i) => i !== idx);
                            setManualForm(calculateTotals({...manualForm, goods: newGoods}));
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div>
                          <label className="text-sm font-medium block mb-1.5">HS Code *</label>
                          <input 
                            value={good.hs_code} 
                            onChange={(e) => {
                              const newGoods = [...manualForm.goods];
                              newGoods[idx] = {...newGoods[idx], hs_code: e.target.value};
                              setManualForm({...manualForm, goods: newGoods});
                            }} 
                            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                            placeholder="XXXX.XX" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Country of Origin *</label>
                          <select 
                            value={good.country_of_origin} 
                            onChange={(e) => {
                              const newGoods = [...manualForm.goods];
                              newGoods[idx] = {...newGoods[idx], country_of_origin: e.target.value};
                              setManualForm({...manualForm, goods: newGoods});
                            }} 
                            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option value="">Select country</option>
                            <option>China</option><option>Japan</option><option>Vietnam</option><option>Germany</option><option>India</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Quantity *</label>
                          <input 
                            type="number" 
                            value={good.quantity} 
                            onChange={(e) => {
                              const newGoods = [...manualForm.goods];
                              newGoods[idx] = {...newGoods[idx], quantity: parseFloat(e.target.value) || 0};
                              setManualForm(calculateTotals({...manualForm, goods: newGoods}));
                            }} 
                            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                            placeholder="0" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Unit Price ($) *</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={good.unit_price} 
                            onChange={(e) => {
                              const newGoods = [...manualForm.goods];
                              newGoods[idx] = {...newGoods[idx], unit_price: parseFloat(e.target.value) || 0};
                              setManualForm(calculateTotals({...manualForm, goods: newGoods}));
                            }} 
                            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                            placeholder="0.00" 
                          />
                        </div>
                        <div className="md:col-span-2 xl:col-span-3">
                          <label className="text-sm font-medium block mb-1.5">Description</label>
                          <textarea 
                            rows={1} 
                            value={good.description} 
                            onChange={(e) => {
                              const newGoods = [...manualForm.goods];
                              newGoods[idx] = {...newGoods[idx], description: e.target.value};
                              setManualForm({...manualForm, goods: newGoods});
                            }} 
                            className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" 
                            placeholder="Description of goods..." 
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="w-full bg-accent/50 rounded-lg px-3 py-2 text-sm font-bold border border-border text-center">
                            Line Total: ${good.line_total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => {
                    const newGoods = [...manualForm.goods, { hs_code: "", country_of_origin: "", quantity: 0, unit_price: 0, description: "", line_total: 0 }];
                    setManualForm({...manualForm, goods: newGoods});
                  }} className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-1" /> Add Another Item
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4 flex-shrink-0">
              <Button variant="outline" onClick={() => setMode("choose")}>Cancel</Button>
              <Button onClick={handleSave}><FileText className="h-4 w-4 mr-1" /> Save Record</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk upload */}
      {mode === "bulk" && (
        <div className="flex flex-col flex-1 min-h-0">
          <BulkUploadPanel entityName="Customs Record" templateColumns={templateColumns} sampleRows={sampleRows} onBack={() => setMode("choose")} />
        </div>
      )}
    </div>
  );
};

export default CustomsDataPage;
