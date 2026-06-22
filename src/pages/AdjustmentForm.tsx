import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Save, Upload, CheckCircle2, Circle, 
  ChevronRight, ChevronLeft, Plus, Trash2, Edit3,
  AlertCircle, FileText, Calculator, ShieldCheck
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const STEPS = [
  { id: 1, name: 'Overview', icon: FileText },
  { id: 2, name: 'Invoices', icon: Edit3 },
  { id: 3, name: 'Commodities', icon: Calculator },
  { id: 4, name: 'Review', icon: ShieldCheck },
];

const AdjustmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdjustmentComplete, setIsAdjustmentComplete] = useState(false);

  // Initialize form with CAD data
  const [form, setForm] = useState({
    cadId: id || "CAD-2024-0876",
    status: "DRAFT_ADJUSTMENT",
    client: "Montreal Wholesale Inc. (MWI-003)",
    dateSubmitted: "Apr 15, 2026",
    certification: false,
    invoices: [
      {
        id: "INV-001",
        number: "INV-8273",
        date: "2026-03-25",
        vendor: "Supplier 1",
        commodities: [
          {
            id: "COM-001",
            hsCode: "7208.51.00.10",
            originalHsCode: "7208.51.00.10",
            tariffTreatment: "MFN",
            originalTariffTreatment: "MFN",
            valueForDuty: 62500.00,
            originalValueForDuty: 62500.00,
            currency: "USD",
            conversionRate: 1.36,
            originalConversionRate: 1.36,
            originCountry: "United States",
            originalOriginCountry: "United States",
            sima: false,
            surtax: false,
            dutyRate: 0.05,
            duty: 4250.00, // (62500 * 1.36) * 0.05
            originalDuty: 4250.00,
            reasons: [] as any[]
          }
        ]
      }
    ],
    totals: {
      presentPaid: 4250.00,
      actualValue: 4250.00,
      diff: 0
    }
  });

  const nextStep = () => {
    if (currentStep === 3) {
      // Basic validation: Any changed line must have at least one reason
      const validationError = form.invoices.some(inv => 
        inv.commodities.some(com => {
          const hasChanged = com.hsCode !== com.originalHsCode || 
                            com.valueForDuty !== com.originalValueForDuty ||
                            com.originCountry !== com.originalOriginCountry ||
                            com.conversionRate !== com.originalConversionRate;
          return hasChanged && com.reasons.length === 0;
        })
      );
      
      if (validationError) {
        alert("At least one adjustment reason is required for each modified commodity line.");
        return;
      }
      
      recalculateAll();
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateCommodity = (invIdx: number, comIdx: number, field: string, value: any) => {
    const newInvoices = [...form.invoices];
    const com = newInvoices[invIdx].commodities[comIdx];
    (com as any)[field] = value;
    
    // Auto-calculate duty if VFD, Rate or Conversion changes
    if (['valueForDuty', 'dutyRate', 'conversionRate'].includes(field)) {
      com.duty = (com.valueForDuty * com.conversionRate) * com.dutyRate;
    }
    
    setForm({ ...form, invoices: newInvoices });
  };

  const applyChanges = async (mode: 'update' | 'reason') => {
    // API: POST /cad/adjustment/update OR POST /cad/adjustment/reason
    console.log(`API Call: POST /cad/adjustment/${mode}`, form);
    // Simulate API hit
    const btn = document.activeElement as HTMLButtonElement;
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = "Applying...";
      btn.disabled = true;
      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        recalculateAll();
      }, 800);
    }
  };

  const addReason = (invIdx: number, comIdx: number) => {
    const newInvoices = [...form.invoices];
    const com = newInvoices[invIdx].commodities[comIdx];
    if (com.reasons.length < 3) {
      com.reasons.push({ code: "", description: "" });
      setForm({ ...form, invoices: newInvoices });
    }
  };

  const updateReason = (invIdx: number, comIdx: number, reaIdx: number, field: string, value: string) => {
    const newInvoices = [...form.invoices];
    newInvoices[invIdx].commodities[comIdx].reasons[reaIdx][field] = value;
    setForm({ ...form, invoices: newInvoices });
  };

  const removeReason = (invIdx: number, comIdx: number, reaIdx: number) => {
    const newInvoices = [...form.invoices];
    newInvoices[invIdx].commodities[comIdx].reasons.splice(reaIdx, 1);
    setForm({ ...form, invoices: newInvoices });
  };

  const recalculateAll = () => {
    let actualValue = 0;
    form.invoices.forEach(inv => {
      inv.commodities.forEach(com => {
        actualValue += com.duty;
      });
    });
    setForm(f => ({
      ...f,
      totals: {
        ...f.totals,
        actualValue,
        diff: actualValue - f.totals.presentPaid
      }
    }));
  };

  const handleSaveDraft = () => {
    // Logic to save as DRAFT_ADJUSTMENT
    console.log("Saving draft...", form);
  };

  const handleSubmit = () => {
    if (!form.certification) {
      alert("Please certify the accuracy of these changes before submitting.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsAdjustmentComplete(true);
      setForm(f => ({ ...f, status: "SUBMITTED" }));
    }, 1500);
  };

  const renderStepIcon = (stepId: number) => {
    if (currentStep > stepId) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (currentStep === stepId) return <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">{stepId}</div>;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Reference ID: {form.cadId}</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 bg-card border rounded-2xl p-6 shadow-sm">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-2 px-4 cursor-pointer transition-colors ${currentStep === step.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => !isAdjustmentComplete && setCurrentStep(step.id)}>
              <div className="flex items-center gap-2">
                {renderStepIcon(step.id)}
                <span className={`text-sm font-semibold ${currentStep === step.id ? 'text-primary' : ''}`}>{step.name}</span>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border mx-4" />
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PageHeader title="Adjustment Overview" description="Review basic CAD information and identify the scope of adjustment." />
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Declaration Context</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Client</p>
                    <p className="text-sm font-medium">{form.client}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Submission Date</p>
                    <p className="text-sm font-medium">{form.dateSubmitted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Type</p>
                    <p className="text-sm font-medium">CAD Adjustment (B2)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
             <PageHeader title="Invoice Selection" description="Select the invoices that require adjustment." />
             <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
               <table className="data-table">
                 <thead>
                   <tr><th>Invoice Number</th><th>Vendor</th><th>Date</th><th>Total Items</th><th className="!text-center">Action</th></tr>
                 </thead>
                 <tbody>
                   {form.invoices.map(inv => (
                     <tr key={inv.id}>
                       <td className="font-bold">{inv.number}</td>
                       <td>{inv.vendor}</td>
                       <td className="text-muted-foreground text-sm">{inv.date}</td>
                       <td>{inv.commodities.length} Commodities</td>
                       <td className="text-center">
                         <Button variant="outline" size="sm" onClick={nextStep}>Edit Commodities</Button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <PageHeader title="Commodity Adjustments" description="Update classification, valuation, and duty information for each commodity line." />
            
            {form.invoices.map((inv, invIdx) => (
              <div key={inv.id} className="space-y-4">
                <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">Invoice: {inv.number}</span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {inv.commodities.map((com, comIdx) => (
                    <div key={com.id} className="bg-card border rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-accent/30 px-4 py-2 border-b flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commodity Line {comIdx + 1}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-medium">Original Duty: ${com.originalDuty.toFixed(2)}</span>
                          <span className="text-sm font-bold text-primary">Corrected Duty: ${com.duty.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                          <div className="col-span-1">
                            <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase tracking-tighter">HS Code</label>
                            <input 
                              value={com.hsCode} 
                              onChange={(e) => updateCommodity(invIdx, comIdx, 'hsCode', e.target.value)}
                              className="w-full bg-background border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none" 
                            />
                            {com.hsCode !== com.originalHsCode && <p className="text-[10px] text-orange-600 mt-1 font-medium">Was: {com.originalHsCode}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase tracking-tighter">Origin Country</label>
                            <select 
                              value={com.originCountry}
                              onChange={(e) => updateCommodity(invIdx, comIdx, 'originCountry', e.target.value)}
                              className="w-full bg-background border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                              <option>United States</option><option>China</option><option>Vietnam</option><option>India</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase tracking-tighter">Tariff Treatment</label>
                            <select 
                              value={com.tariffTreatment}
                              onChange={(e) => updateCommodity(invIdx, comIdx, 'tariffTreatment', e.target.value)}
                              className="w-full bg-background border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                              <option>MFN</option><option>UST</option><option>GPT</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase tracking-tighter">Value (CAD/USD)</label>
                            <div className="flex gap-1">
                              <input 
                                type="number"
                                value={com.valueForDuty} 
                                onChange={(e) => updateCommodity(invIdx, comIdx, 'valueForDuty', parseFloat(e.target.value) || 0)}
                                className="w-2/3 bg-background border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none font-mono" 
                              />
                              <input 
                                type="number"
                                step="0.0001"
                                value={com.conversionRate} 
                                onChange={(e) => updateCommodity(invIdx, comIdx, 'conversionRate', parseFloat(e.target.value) || 0)}
                                className="w-1/3 bg-background border rounded-lg px-1 py-1.5 text-[10px] focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                title="Currency Conversion Rate"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col justify-center gap-1">
                             <div className="flex items-center gap-1">
                               <input type="checkbox" id={`sima-${com.id}`} checked={com.sima} onChange={(e) => updateCommodity(invIdx, comIdx, 'sima', e.target.checked)} />
                               <label htmlFor={`sima-${com.id}`} className="text-[10px] font-medium">SIMA</label>
                             </div>
                             <div className="flex items-center gap-1">
                               <input type="checkbox" id={`surtax-${com.id}`} checked={com.surtax} onChange={(e) => updateCommodity(invIdx, comIdx, 'surtax', e.target.checked)} />
                               <label htmlFor={`surtax-${com.id}`} className="text-[10px] font-medium">Surtax</label>
                             </div>
                          </div>
                          <div className="flex flex-col gap-1 items-end pt-5">
                            <div className="w-full bg-primary/10 rounded-lg px-2 py-1 text-xs font-bold border border-primary/20 text-center text-primary">
                              ${com.duty.toFixed(2)}
                            </div>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 w-full" onClick={() => applyChanges('update')}>
                              Apply Changes
                            </Button>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                              Adjustment Reasons ({com.reasons.length}/3)
                            </h4>
                            <div className="flex items-center gap-2">
                              {com.reasons.length > 0 && (
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-emerald-600 hover:bg-emerald-50" onClick={() => applyChanges('reason')}>
                                  <Save className="h-3 w-3 mr-1" /> Save Reasons
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={com.reasons.length >= 3} 
                                onClick={() => addReason(invIdx, comIdx)}
                                className="h-7 text-xs text-primary hover:bg-primary/5"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Reason
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {com.reasons.map((rea, reaIdx) => (
                              <div key={reaIdx} className="flex gap-3 items-start animate-in slide-in-from-left-2">
                                <select 
                                  value={rea.code}
                                  onChange={(e) => updateReason(invIdx, comIdx, reaIdx, 'code', e.target.value)}
                                  className="w-1/3 bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none italic"
                                >
                                  <option value="">Select Code</option>
                                  <option value="Valuation - Method 1">Valuation - Method 1</option>
                                  <option value="Classification - Incorrect HS">Classification - Incorrect HS</option>
                                  <option value="Origin - Incorrect Origin">Origin - Incorrect Origin</option>
                                </select>
                                <textarea 
                                  rows={1}
                                  placeholder="Provide detailed explanation..."
                                  value={rea.description}
                                  onChange={(e) => updateReason(invIdx, comIdx, reaIdx, 'description', e.target.value)}
                                  className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeReason(invIdx, comIdx, reaIdx)}
                                  className="text-destructive hover:bg-destructive/5 px-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {com.reasons.length === 0 && (
                              <p className="text-xs text-muted-foreground italic text-center py-2 bg-muted/20 rounded-lg border border-dashed">
                                No reasons added. At least one reason is required for any changes.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PageHeader title="Review & Certification" description="Review adjusted values and certify the declaration before final submission." />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-accent/30 px-4 py-2 border-b">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adjustment Summary</h3>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30">
                        <tr className="text-left"><th className="px-4 py-2 border-b">Line</th><th className="px-4 py-2 border-b">Change</th><th className="px-4 py-2 border-b">Reasons</th><th className="px-4 py-2 border-b text-right">Duty Change</th></tr>
                      </thead>
                      <tbody>
                        {form.invoices.flatMap(inv => inv.commodities).map((com, idx) => {
                          const hasChanged = com.hsCode !== com.originalHsCode || 
                                            com.valueForDuty !== com.originalValueForDuty ||
                                            com.originCountry !== com.originalOriginCountry ||
                                            com.conversionRate !== com.originalConversionRate;
                          if (!hasChanged) return null;
                          return (
                            <tr key={com.id} className="border-b last:border-0">
                              <td className="px-4 py-3 font-medium">#{idx + 1}</td>
                              <td className="px-4 py-3">
                                {com.hsCode !== com.originalHsCode && <div className="text-[10px]">HS: <span className="line-through text-muted-foreground">{com.originalHsCode}</span> → <span className="font-bold text-primary">{com.hsCode}</span></div>}
                                {com.originCountry !== com.originalOriginCountry && <div className="text-[10px]">Origin: <span className="line-through text-muted-foreground">{com.originalOriginCountry}</span> → <span className="font-bold text-primary">{com.originCountry}</span></div>}
                                {com.valueForDuty !== com.originalValueForDuty && <div className="text-[10px]">Val: <span className="line-through text-muted-foreground">${com.originalValueForDuty.toFixed(2)}</span> → <span className="font-bold text-primary">${com.valueForDuty.toFixed(2)}</span></div>}
                                {com.conversionRate !== com.originalConversionRate && <div className="text-[10px]">Rate: <span className="line-through text-muted-foreground">{com.originalConversionRate}</span> → <span className="font-bold text-primary">{com.conversionRate}</span></div>}
                              </td>
                              <td className="px-4 py-3">
                                {com.reasons.map((r, i) => <div key={i} className="text-[10px] bg-primary/5 text-primary rounded px-1.5 py-0.5 inline-block mr-1 mb-1 font-bold">{r.code}</div>)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-bold ${com.duty - com.originalDuty < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {com.duty - com.originalDuty > 0 ? '+' : ''}${(com.duty - com.originalDuty).toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-accent/10 border-2 border-primary/20 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-primary italic">Statement of Certification</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    By checking the box below, I certify that the information provided in this adjustment is true, accurate, and complete to the best of my knowledge. I understand that any false statements may result in penalties or legal action under the Customs Act.
                  </p>
                  <label className="flex items-center gap-3 p-3 bg-card border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" 
                      checked={form.certification}
                      onChange={(e) => setForm({...form, certification: e.target.checked})}
                      disabled={isAdjustmentComplete}
                    />
                    <span className="text-sm font-semibold">I certify the accuracy of these adjustments.</span>
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Financial Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Present Paid Total:</span>
                      <span className="font-mono">${form.totals.presentPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Adjusted Total:</span>
                      <span className="font-mono">${form.totals.actualValue.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between">
                      <span className="font-bold">Net Difference:</span>
                      <span className={`font-mono font-bold ${form.totals.diff < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {form.totals.diff > 0 ? '+' : ''}${form.totals.diff.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {form.totals.diff < 0 && (
                    <div className="bg-emerald-50 text-emerald-700 text-[10px] p-2 rounded border border-emerald-200 font-bold uppercase text-center mt-2">
                      Estimated Refund: ${Math.abs(form.totals.diff).toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="bg-muted p-6 rounded-xl border space-y-3 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Supporting Documents</h4>
                  <p className="text-[10px] text-muted-foreground">Required for valuation changes or duty refunds.</p>
                  <Button variant="outline" size="sm" className="w-full text-xs" disabled={isAdjustmentComplete}>
                    <Plus className="h-3 w-3 mr-1" /> Add Attachments
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAdjustmentComplete && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-card border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold italic">Adjustment Submitted</h2>
              <p className="text-muted-foreground mt-2">The declaration has been locked and moved to <span className="font-bold text-foreground italic">ADJUSTMENT_IN_PROGRESS</span> status.</p>
            </div>
            
            <div className="bg-muted p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Upload className="h-4 w-4" /> Supporting Documents
              </div>
              <p className="text-[10px] text-muted-foreground text-left leading-relaxed">
                You can now upload final supporting evidence for this adjustment. This module remains open until the adjustment is approved by a manager.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs">
                Browse Files
              </Button>
            </div>

            <Button className="w-full" onClick={() => navigate("/adjustments")}>
              Return to Discrepancy List
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Current Difference</p>
              <p className={`text-sm font-bold ${form.totals.diff < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {form.totals.diff > 0 ? '+' : ''}${form.totals.diff.toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={isAdjustmentComplete}>
              <Save className="h-4 w-4 mr-1" /> Save Draft
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 1 || isAdjustmentComplete}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {currentStep < 4 ? (
              <Button size="sm" onClick={nextStep}>
                Next Step <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={isSubmitting || isAdjustmentComplete}>
                {isSubmitting ? "Submitting..." : "Submit Adjustment"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentForm;

