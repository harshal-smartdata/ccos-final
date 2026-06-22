import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, ChevronRight, Plus, Trash2, CheckCircle2, AlertTriangle, HelpCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const modeOfTransport = [
  { value: "01", label: "01 - Marine" },
  { value: "02", label: "02 - Highway" },
  { value: "03", label: "03 - Rail" },
  { value: "04", label: "04 - Air" },
  { value: "05", label: "05 - Mail" },
  { value: "09", label: "09 - Other" },
];

const cbsaOffices = [
  { value: "0813", label: "0813 - Pacific Highway" },
  { value: "0494", label: "0494 - Toronto Pearson Int'l Airport" },
  { value: "0395", label: "0395 - Montreal Pierre Elliott Trudeau Int'l Airport" },
  { value: "0214", label: "0214 - Halifax Stanfield Int'l Airport" },
  { value: "0809", label: "0809 - Douglas (Peace Arch)" },
  { value: "0427", label: "0427 - Windsor-Detroit Tunnel" },
  { value: "0453", label: "0453 - Ambassador Bridge" }
];

const currencies = ["CAD - Canadian Dollar", "USD - US Dollar", "EUR - Euro", "GBP - British Pound", "CNY - Chinese Yuan", "JPY - Japanese Yen"];
const countries = ["China", "Japan", "Vietnam", "Germany", "India", "South Korea", "Taiwan", "United States", "Mexico", "Italy"];
const unitMeasures = ["NMB - Number", "KGM - Kilograms", "MTR - Metres", "LTR - Litres", "DZN - Dozen", "PCS - Pieces"];
const tariffTreatments = [
  "002 - Most-Favoured-Nation Tariff",
  "010 - General Tariff",
  "015 - General Preferential Tariff",
  "020 - CUSMA Tariff",
];
const vfdCodes = [
  "013 - New goods, Vendor and purchaser are not related, Price paid or payable without adjustment",
  "020 - Transaction value with adjustments",
  "030 - Identical goods value",
  "040 - Similar goods value",
];

interface Invoice {
  id: string;
  invoice_number: string;
  purchase_order: string;
  invoice_date: string;
  currency: string;
  total_invoice_value: string;
  vendor_name: string;
  vendor_address: string;
  country_of_export: string;
  country_of_origin: string;
  payment_terms: string;
  us_port_exit: string;
  purchaser_different: boolean;
  commodities: Commodity[];
}

interface Commodity {
  id: string;
  direct_shipment_date: string;
  classification_number: string;
  classification_description: string;
  narrative_description: string;
  quantity: string;
  unit_of_measure: string;
  value_for_currency: string;
  currency: string;
  country_of_origin: string;
  place_of_export: string;
  place_of_export_state: string;
  tariff_treatment: string;
  tariff_code: string;
  vfd_code: string;
  ruling_number: string;
  sima_applicable: boolean;
  sima_code: string;
  surtax_applicable: boolean;
  surtax_code: string;
  special_authority_oic: string;
  duties_customs: string;
  duties_excise: string;
  duties_gst: string;
}

const emptyInvoice = (): Invoice => ({
  id: "inv-" + Date.now() + "-" + Math.random().toString(36).substring(2),
  invoice_number: "",
  purchase_order: "",
  invoice_date: "",
  currency: "",
  total_invoice_value: "",
  vendor_name: "",
  vendor_address: "",
  country_of_export: "",
  country_of_origin: "",
  payment_terms: "",
  us_port_exit: "",
  purchaser_different: false,
  commodities: [],
});

const emptyCommodity = (): Commodity => ({
  id: "com-" + Date.now() + "-" + Math.random().toString(36).substring(2),
  direct_shipment_date: "",
  classification_number: "",
  classification_description: "",
  narrative_description: "",
  quantity: "",
  unit_of_measure: "",
  value_for_currency: "",
  currency: "",
  country_of_origin: "",
  place_of_export: "",
  place_of_export_state: "",
  tariff_treatment: "",
  tariff_code: "",
  vfd_code: "",
  ruling_number: "",
  sima_applicable: false,
  sima_code: "",
  surtax_applicable: false,
  surtax_code: "",
  special_authority_oic: "",
  duties_customs: "",
  duties_excise: "",
  duties_gst: "",
});

const inputClass = "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
const labelClass = "text-sm font-medium block mb-1.5";
const requiredMark = <span className="text-red-500 ml-0.5">*</span>;

const CADForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [step, setStep] = useState<number>(0); // 0=overview, 1=general, 2=invoices, 3=review
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [customsRecords, setCustomsRecords] = useState<any[]>([]);
  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem('customsRecords') || '[]');
    if (stored.length === 0 || stored[0]?.client_id === "Toronto Tech Solutions (TTS-001)") {
      stored = [
        {
          id: "cr-demo-1",
          transaction_number: "TXN-2026-001",
          client_id: "Client 1",
          supplier_id: "Supplier 1",
          vendor_address: "88 Industrial Rd, Shanghai 200000, China",
          import_date: "2026-04-15",
          invoice: {
            invoice_number: "INV-8273",
            purchase_order: "PO-991",
            invoice_date: "2026-03-25",
            currency: "USD - US Dollar",
            payment_terms: "Net 30",
            country_of_export: "China",
            us_port_of_exit: "Seattle, WA"
          },
          goods: [
            {
              hs_code: "7208.51.00.10",
              country_of_origin: "China",
              quantity: 5000,
              unit_price: 12.50,
              description: "Hot-rolled steel coil",
              line_total: 62500
            },
            {
              hs_code: "7208.52.00.00",
              country_of_origin: "China",
              quantity: 2500,
              unit_price: 15.00,
              description: "Cold-rolled steel coil",
              line_total: 37500
            }
          ],
          total_invoice_value: 100000,
          created_at: "2026-04-15T10:00:00Z",
          updated_at: "2026-04-15T10:00:00Z"
        },
        {
          id: "cr-demo-2",
          transaction_number: "TXN-2026-002",
          client_id: "Client 2",
          supplier_id: "Supplier 2",
          vendor_address: "23-5 Shiba-park, Minato-ku, Tokyo 105-0011, Japan",
          import_date: "2026-04-16",
          invoice: {
            invoice_number: "INV-4412",
            purchase_order: "",
            invoice_date: "2026-03-26",
            currency: "JPY - Japanese Yen",
            payment_terms: "Net 60",
            country_of_export: "Japan",
            us_port_of_exit: "Los Angeles, CA"
          },
          goods: [
            {
              hs_code: "8708.29",
              country_of_origin: "Japan",
              quantity: 200,
              unit_price: 45.00,
              description: "Auto brake assemblies",
              line_total: 9000
            }
          ],
          total_invoice_value: 9000,
          created_at: "2026-04-16T11:00:00Z",
          updated_at: "2026-04-16T11:00:00Z"
        }
      ];
      localStorage.setItem('customsRecords', JSON.stringify(stored));
    }
    setCustomsRecords(stored);
  }, []);



  // General details
  const [general, setGeneral] = useState({
    declaration_type: isEdit ? "AB - With Release" : "AB - With Release",
    cbsa_office_region: "",
    cbsa_office: isEdit ? "0813" : "",
    cbsa_sub_office: "",
    transaction_number: isEdit ? "99902151552125" : "",
    mode_of_transport: isEdit ? "02" : "",
    release_date: isEdit ? "2026-04-14" : "",
    port_of_unlading_region: "",
    port_of_unlading: "",
    carrier_code: "",
    cargo_control_numbers: isEdit ? ["2145"] : [""],
    gross_weight_kg: isEdit ? "12000" : "0",
    freight_charges: isEdit ? "2500" : "0",
  });

  // Importer info (auto-populated)
  const importer = {
    name: isEdit ? "Client 1" : "—",
    bn_number: isEdit ? "123456789RM0001" : "—",
    address: isEdit ? "123 Business Rd, Toronto, ON, CA" : "—",
    phone: isEdit ? "555-0123" : "—",
  };

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>(
    isEdit ? [{
      ...emptyInvoice(),
      invoice_number: "273637",
      vendor_name: "Shanghai Metals Ltd.",
      vendor_address: "88 Industrial Rd, Shanghai 200000, China",
      country_of_export: "China",
      invoice_date: "2026-04-01",
      currency: "USD - US Dollar",
      total_invoice_value: "62500",
      country_of_origin: "China",
      payment_terms: "Net 30",
      commodities: [{
        ...emptyCommodity(),
        direct_shipment_date: "2026-04-01",
        classification_number: "7208.51.00.10",
        classification_description: "Flat-rolled products of iron or non-alloy steel, of a width of 600 mm or more, hot-rolled",
        narrative_description: "Hot-rolled steel coil",
        quantity: "5000",
        unit_of_measure: "KGM - Kilograms",
        value_for_currency: "62500",
        currency: "USD - US Dollar",
        country_of_origin: "China",
        place_of_export: "China",
        place_of_export_state: "",
        tariff_treatment: "002 - Most-Favoured-Nation Tariff",
        vfd_code: "013 - New goods, Vendor and purchaser are not related, Price paid or payable without adjustment",
        ruling_number: "",
        sima_applicable: false,
        sima_code: "",
        surtax_applicable: false,
        surtax_code: "",
        special_authority_oic: "",
        duties_customs: "4230.00",
        duties_excise: "0.00",
        duties_gst: "845.00",
      }],
    }] : []
  );

  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const updateGeneral = (key: string, value: string | string[]) => setGeneral((g) => ({ ...g, [key]: value }));

  const addCCN = () => updateGeneral("cargo_control_numbers", [...general.cargo_control_numbers, ""]);
  const removeCCN = (idx: number) => updateGeneral("cargo_control_numbers", general.cargo_control_numbers.filter((_, i) => i !== idx));
  const updateCCN = (idx: number, val: string) => {
    const copy = [...general.cargo_control_numbers];
    copy[idx] = val;
    updateGeneral("cargo_control_numbers", copy);
  };

  const addInvoice = () => setInvoices([...invoices, emptyInvoice()]);
  const removeInvoice = (id: string) => setInvoices(invoices.filter((inv) => inv.id !== id));
  const updateInvoice = (id: string, key: string, value: string | boolean) =>
    setInvoices(invoices.map((inv) => inv.id === id ? { ...inv, [key]: value } : inv));

  const addCommodity = (invoiceId: string) =>
    setInvoices(invoices.map((inv) => inv.id === invoiceId ? { ...inv, commodities: [...inv.commodities, emptyCommodity()] } : inv));
  const removeCommodity = (invoiceId: string, commodityId: string) =>
    setInvoices(invoices.map((inv) => inv.id === invoiceId ? { ...inv, commodities: inv.commodities.filter((c) => c.id !== commodityId) } : inv));
  const updateCommodity = (invoiceId: string, commodityId: string, key: string, value: string | boolean) =>
    setInvoices(invoices.map((inv) => inv.id === invoiceId ? { ...inv, commodities: inv.commodities.map((c) => c.id === commodityId ? { ...c, [key]: value } : c) } : inv));

  const handleInvoiceNumberSelect = (invoiceId: string, invoiceNumber: string) => {
    const record = customsRecords.find(r => r.invoice?.invoice_number === invoiceNumber);
    if (!record) return;

    const newCommodities = (record.goods || []).map((g: any, i: number) => ({
      ...emptyCommodity(),
      id: "com-" + Date.now() + "-" + i + "-" + Math.random().toString(36).substring(2),
      classification_number: g.hs_code || "",
      country_of_origin: g.country_of_origin || "",
      quantity: (g.quantity || "").toString(),
      value_for_currency: (g.line_total || (parseFloat(g.quantity) * parseFloat(g.unit_price)) || 0).toFixed(2),
      narrative_description: g.description || "",
      direct_shipment_date: record.import_date || "",
      currency: record.invoice?.currency || ""
    }));
    
    setInvoices(invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          invoice_number: invoiceNumber,
          vendor_name: record.supplier_id || inv.vendor_name,
          vendor_address: record.vendor_address || inv.vendor_address,
          invoice_date: record.invoice?.invoice_date || record.import_date || inv.invoice_date,
          currency: record.invoice?.currency || inv.currency,
          country_of_export: record.invoice?.country_of_export || inv.country_of_export,
          payment_terms: record.invoice?.payment_terms || inv.payment_terms,
          us_port_exit: record.invoice?.us_port_of_exit || inv.us_port_exit,
          total_invoice_value: (record.total_invoice_value || 0).toFixed(2),
          commodities: newCommodities.length > 0 ? newCommodities : inv.commodities
        };
      }
      return inv;
    }));
  };

  const goToStep = (s: number) => {
    if (step > 0 && !completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    setStep(s);
  };

  const handleValidateAndSubmit = () => {
    const errs: string[] = [];
    if (!general.transaction_number) errs.push("Transaction number is required");
    if (!general.cbsa_office) errs.push("CBSA office is required");
    if (!general.mode_of_transport) errs.push("Mode of transport is required");
    if (!general.release_date) errs.push("Release date is required");
    if (invoices.length === 0) errs.push("At least one invoice is required");
    invoices.forEach((inv, i) => {
      if (!inv.invoice_number && !inv.purchase_order) errs.push(`Invoice ${i + 1}: invoice number or purchase order required`);
      if (inv.commodities.length === 0) errs.push(`Invoice ${i + 1}: at least one commodity required`);
      inv.commodities.forEach((c, j) => {
        if (!c.narrative_description) errs.push(`Invoice ${i + 1}, Commodity ${j + 1}: description required`);
        if (!c.classification_number) errs.push(`Invoice ${i + 1}, Commodity ${j + 1}: classification number required`);
        if (!c.quantity) errs.push(`Invoice ${i + 1}, Commodity ${j + 1}: quantity required`);
        if (!c.unit_of_measure) errs.push(`Invoice ${i + 1}, Commodity ${j + 1}: unit of measure required`);
        if (!c.value_for_currency) errs.push(`Invoice ${i + 1}, Commodity ${j + 1}: value required`);
        if (!c.country_of_origin) errs.push(`Invoice ${i + 1}, Commodity ${j + 1}: country of origin required`);
      });
    });
    setValidationErrors(errs);
    setShowValidation(true);
  };

  // Estimate duties
  const totalDuties = invoices.reduce((sum, inv) => sum + inv.commodities.reduce((s, c) => s + (parseFloat(c.duties_customs) || 0), 0), 0);
  const totalGST = invoices.reduce((sum, inv) => sum + inv.commodities.reduce((s, c) => s + (parseFloat(c.duties_gst) || 0), 0), 0);
  const totalExcise = invoices.reduce((sum, inv) => sum + inv.commodities.reduce((s, c) => s + (parseFloat(c.duties_excise) || 0), 0), 0);
  const totalAll = totalDuties + totalGST + totalExcise;

  const stepLabels = ["Step 1: General details", "Step 2: Invoices & commodities", "Step 3: Review & submit"];

  const uniqueInvoiceNumbers = Array.from(new Set(customsRecords.map(r => r.invoice?.invoice_number).filter(Boolean)));

  return (
    <div>


      <h1 className="text-xl font-bold mb-1">{isEdit ? "Edit Declaration" : "Create Declaration"}</h1>
      <p className="text-sm text-muted-foreground mb-6">Commercial Accounting Declaration (CAD) — Type AB</p>

      <div className="flex gap-6">
        {/* Left sidebar — Overview */}
        <div className="w-64 shrink-0">
          <div className="bg-card rounded-xl border shadow-sm p-5 sticky top-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overview</h3>
            <dl className="space-y-2 text-sm mb-5">
              <div><dt className="text-muted-foreground text-xs">Status</dt><dd className="font-medium text-amber-600">Draft</dd></div>
              <div><dt className="text-muted-foreground text-xs">Type</dt><dd className="font-medium">AB</dd></div>
              <div><dt className="text-muted-foreground text-xs">Transaction #</dt><dd className="font-mono text-xs">{general.transaction_number || "—"}</dd></div>
            </dl>

            <div className="space-y-1">
              {stepLabels.map((label, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isCompleted = completedSteps.includes(stepNum);
                return (
                  <button
                    key={label}
                    onClick={() => goToStep(stepNum)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 shrink-0 ${isActive ? "border-primary" : "border-muted-foreground/40"}`} />
                    )}
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            {totalAll > 0 && (
              <div className="mt-5 pt-4 border-t space-y-1">
                <div className="text-xs text-muted-foreground">Est. duties & taxes</div>
                <div className="text-lg font-bold text-foreground">${totalAll.toLocaleString("en-CA", { minimumFractionDigits: 2 })} CAD</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Step 0: Overview / Start */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h2 className="text-base font-semibold mb-4">Review information to start declaration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Declaration Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Declaration Type {requiredMark}</label>
                        <select value={general.declaration_type} disabled className={inputClass + " bg-muted"}>
                          <option>AB - With Release</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>CBSA Office {requiredMark}</label>
                        <select value={general.cbsa_office} onChange={(e) => updateGeneral("cbsa_office", e.target.value)} className={inputClass}>
                          <option value="">Select an option</option>
                          {cbsaOffices.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>Transaction Number {requiredMark}</label>
                        <input value={general.transaction_number} onChange={(e) => updateGeneral("transaction_number", e.target.value)} className={inputClass + " font-mono"} placeholder="Maximum 14 characters" maxLength={14} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Importer</h4>
                  <div className="bg-accent/50 rounded-lg p-4 space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{importer.name}</span></div>
                    <div><span className="text-muted-foreground">BN Number:</span> <span className="font-mono text-xs">{importer.bn_number}</span></div>
                    <div><span className="text-muted-foreground">Address:</span> {importer.address}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {importer.phone}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button onClick={() => goToStep(1)}>
                  Start <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            </div>
          )}

          {/* Step 1: General Details */}
          {step === 1 && (
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
              <h2 className="text-base font-semibold">Step 1: General Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Mode of Transport {requiredMark}</label>
                  <select value={general.mode_of_transport} onChange={(e) => updateGeneral("mode_of_transport", e.target.value)} className={inputClass}>
                    <option value="">Select an option</option>
                    {modeOfTransport.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Release Date {requiredMark}</label>
                  <input type="date" value={general.release_date} onChange={(e) => updateGeneral("release_date", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Port of Unlading Region <HelpCircle className="h-3 w-3 inline text-muted-foreground" /></label>
                  <input value={general.port_of_unlading_region} onChange={(e) => updateGeneral("port_of_unlading_region", e.target.value)} className={inputClass} placeholder="Select an option" />
                </div>
                <div>
                  <label className={labelClass}>Port of Unlading <HelpCircle className="h-3 w-3 inline text-muted-foreground" /></label>
                  <input value={general.port_of_unlading} onChange={(e) => updateGeneral("port_of_unlading", e.target.value)} className={inputClass} placeholder="Select an option" />
                </div>
                <div>
                  <label className={labelClass}>Carrier Code <HelpCircle className="h-3 w-3 inline text-muted-foreground" /></label>
                  <input value={general.carrier_code} onChange={(e) => updateGeneral("carrier_code", e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Cargo Control Number {requiredMark}</label>
                {general.cargo_control_numbers.map((ccn, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={ccn} onChange={(e) => updateCCN(i, e.target.value)} className={inputClass} placeholder="Enter CCN" />
                    {general.cargo_control_numbers.length > 1 && (
                      <button onClick={() => removeCCN(i)} className="text-muted-foreground hover:text-red-500 px-2"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={addCCN} className="text-sm text-primary hover:underline">+ Add additional</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Gross Weight in kg <HelpCircle className="h-3 w-3 inline text-muted-foreground" /></label>
                  <input type="number" value={general.gross_weight_kg} onChange={(e) => updateGeneral("gross_weight_kg", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Freight Charges <HelpCircle className="h-3 w-3 inline text-muted-foreground" /></label>
                  <input type="number" value={general.freight_charges} onChange={(e) => updateGeneral("freight_charges", e.target.value)} className={inputClass} />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">You can save a draft of your CAD for up to 30 days.</p>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => goToStep(0)}>← Previous</Button>
                <div className="flex gap-2">
                  <Button variant="outline"><Save className="h-4 w-4 mr-1" /> Save draft</Button>
                  <Button onClick={() => goToStep(2)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Invoices & Commodities */}
          {step === 2 && (
            <div className="space-y-6">


              <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold">Step 2: Invoices & Commodities</h2>
                  <Button size="sm" onClick={addInvoice}><Plus className="h-4 w-4 mr-1" /> Add Invoice</Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">After adding an invoice, click the commodity action button to add product information.</p>

                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No invoices added yet. Click "Add Invoice" to begin.</p>
                  </div>
                ) : (
                  <div className="bg-card rounded-lg border overflow-hidden">
                    <table className="data-table text-sm">
                      <thead>
                        <tr><th>Line #</th><th>Invoice #</th><th>Vendor</th><th>Commodities</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv, i) => (
                          <tr key={inv.id}>
                            <td className="font-medium">{i + 1}</td>
                            <td className="font-mono text-xs">{inv.invoice_number || "—"}</td>
                            <td>{inv.vendor_name || "—"}</td>
                            <td>{inv.commodities.length}</td>
                            <td>
                              <div className="flex gap-1">
                                <button onClick={() => addCommodity(inv.id)} className="text-xs text-primary hover:underline">+ Commodity</button>
                                <span className="text-muted-foreground">|</span>
                                <button onClick={() => removeInvoice(inv.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Expanded Invoice Forms */}
              {invoices.map((inv, invIdx) => (
                <div key={inv.id} className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
                  <h3 className="text-sm font-semibold">Invoice #{invIdx + 1} Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Invoice Number</label>
                      <select 
                        value={inv.invoice_number} 
                        onChange={(e) => handleInvoiceNumberSelect(inv.id, e.target.value)} 
                        className={inputClass}
                      >
                        <option value="">Select Invoice</option>
                        {uniqueInvoiceNumbers.map(invNum => (
                          <option key={invNum as string} value={invNum as string}>{invNum as string}</option>
                        ))}
                        {inv.invoice_number && !uniqueInvoiceNumbers.includes(inv.invoice_number) && (
                          <option value={inv.invoice_number}>{inv.invoice_number}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Purchase Order Number {!inv.invoice_number && requiredMark}</label>
                      <input value={inv.purchase_order} onChange={(e) => updateInvoice(inv.id, "purchase_order", e.target.value)} className={inputClass} placeholder="If no invoice number" />
                    </div>
                    <div>
                      <label className={labelClass}>Invoice Date {requiredMark}</label>
                      <input type="date" value={inv.invoice_date} onChange={(e) => updateInvoice(inv.id, "invoice_date", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Currency {requiredMark}</label>
                      <select value={inv.currency} onChange={(e) => updateInvoice(inv.id, "currency", e.target.value)} className={inputClass}>
                        <option value="">Select</option>
                        {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Total Invoice Value</label>
                      <input type="number" value={inv.total_invoice_value} onChange={(e) => updateInvoice(inv.id, "total_invoice_value", e.target.value)} className={inputClass} placeholder="Auto-calculated or manual" />
                    </div>
                    <div>
                      <label className={labelClass}>Vendor Name {requiredMark}</label>
                      <input value={inv.vendor_name} onChange={(e) => updateInvoice(inv.id, "vendor_name", e.target.value)} className={inputClass} placeholder="Vendor / supplier name" />
                    </div>
                    <div>
                      <label className={labelClass}>Vendor Address</label>
                      <input value={inv.vendor_address} onChange={(e) => updateInvoice(inv.id, "vendor_address", e.target.value)} className={inputClass} placeholder="Full address" />
                    </div>
                    <div>
                      <label className={labelClass}>Country of Export</label>
                      <select value={inv.country_of_export} onChange={(e) => updateInvoice(inv.id, "country_of_export", e.target.value)} className={inputClass}>
                        <option value="">Select country</option>
                        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Country of Origin (Optional)</label>
                      <select value={inv.country_of_origin} onChange={(e) => updateInvoice(inv.id, "country_of_origin", e.target.value)} className={inputClass}>
                        <option value="">Select country</option>
                        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Payment Terms</label>
                      <input value={inv.payment_terms} onChange={(e) => updateInvoice(inv.id, "payment_terms", e.target.value)} className={inputClass} placeholder="e.g. Net 30" />
                    </div>
                    <div>
                      <label className={labelClass}>US Port of Exit <HelpCircle className="h-3 w-3 inline text-muted-foreground" /></label>
                      <input value={inv.us_port_exit} onChange={(e) => updateInvoice(inv.id, "us_port_exit", e.target.value)} className={inputClass} placeholder="e.g., 3004 - Blaine, WA" />
                    </div>
                  </div>

               

                  {/* Commodities for this invoice */}
                  {inv.commodities.map((com, comIdx) => (
                    <div key={com.id} className="bg-accent/30 rounded-lg border p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Commodity #{comIdx + 1}</h4>
                        <button onClick={() => removeCommodity(inv.id, com.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>



                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Direct Shipment Date {requiredMark}</label>
                          <input type="date" value={com.direct_shipment_date} onChange={(e) => updateCommodity(inv.id, com.id, "direct_shipment_date", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Classification Number {requiredMark}
                          </label>
                          <input value={com.classification_number} onChange={(e) => updateCommodity(inv.id, com.id, "classification_number", e.target.value)} className={inputClass + " font-mono"} placeholder="XXXX.XX.XX.XX" />
                        </div>
                      </div>
                      {com.classification_number && (
                        <div>
                          <label className={labelClass}>Classification Description</label>
                          <div className="text-sm bg-muted rounded-lg p-3 text-muted-foreground">{com.classification_description || "Enter classification number to auto-populate"}</div>
                        </div>
                      )}
                      <div>
                        <label className={labelClass}>Narrative Description (max 132 chars) {requiredMark}</label>
                        <input value={com.narrative_description} onChange={(e) => updateCommodity(inv.id, com.id, "narrative_description", e.target.value)} className={inputClass} maxLength={132} placeholder="Describe the commodity" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className={labelClass}>Quantity {requiredMark}</label>
                          <input type="number" value={com.quantity} onChange={(e) => updateCommodity(inv.id, com.id, "quantity", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Unit of Measure {requiredMark}</label>
                          <select value={com.unit_of_measure} onChange={(e) => updateCommodity(inv.id, com.id, "unit_of_measure", e.target.value)} className={inputClass}>
                            <option value="">Select</option>
                            {unitMeasures.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Value for Currency {requiredMark}</label>
                          <input type="number" value={com.value_for_currency} onChange={(e) => updateCommodity(inv.id, com.id, "value_for_currency", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Currency {requiredMark}</label>
                          <select value={com.currency} onChange={(e) => updateCommodity(inv.id, com.id, "currency", e.target.value)} className={inputClass}>
                            <option value="">Select</option>
                            {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Country of Origin {requiredMark}</label>
                          <select value={com.country_of_origin} onChange={(e) => updateCommodity(inv.id, com.id, "country_of_origin", e.target.value)} className={inputClass}>
                            <option value="">Select</option>
                            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Place of Export {requiredMark}</label>
                          <select value={com.place_of_export} onChange={(e) => updateCommodity(inv.id, com.id, "place_of_export", e.target.value)} className={inputClass}>
                            <option value="">Select</option>
                            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Place of Export State</label>
                          <input value={com.place_of_export_state} onChange={(e) => updateCommodity(inv.id, com.id, "place_of_export_state", e.target.value)} className={inputClass} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Tariff Treatment {requiredMark}</label>
                          <select value={com.tariff_treatment} onChange={(e) => updateCommodity(inv.id, com.id, "tariff_treatment", e.target.value)} className={inputClass}>
                            <option value="">Select</option>
                            {tariffTreatments.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Value for Duty Code {requiredMark}</label>
                          <select value={com.vfd_code} onChange={(e) => updateCommodity(inv.id, com.id, "vfd_code", e.target.value)} className={inputClass}>
                            <option value="">Select</option>
                            {vfdCodes.map((v) => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Ruling Number</label>
                          <input value={com.ruling_number} onChange={(e) => updateCommodity(inv.id, com.id, "ruling_number", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                            <input type="checkbox" checked={com.sima_applicable} onChange={(e) => updateCommodity(inv.id, com.id, "sima_applicable", e.target.checked)} className="rounded border-border" />
                            Apply SIMA
                          </label>
                          {com.sima_applicable && (
                            <input value={com.sima_code} onChange={(e) => updateCommodity(inv.id, com.id, "sima_code", e.target.value)} className={inputClass} placeholder="SIMA Code" />
                          )}
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                            <input type="checkbox" checked={com.surtax_applicable} onChange={(e) => updateCommodity(inv.id, com.id, "surtax_applicable", e.target.checked)} className="rounded border-border" />
                            Apply Surtax
                          </label>
                          {com.surtax_applicable && (
                            <input value={com.surtax_code} onChange={(e) => updateCommodity(inv.id, com.id, "surtax_code", e.target.value)} className={inputClass} placeholder="Surtax Code" />
                          )}
                        </div>
                      </div>

                      {/* Special Authorities */}
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Special Authorities</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>Special Authority OIC</label>
                            <input value={com.special_authority_oic} onChange={(e) => updateCommodity(inv.id, com.id, "special_authority_oic", e.target.value)} className={inputClass} />
                          </div>
                        </div>
                      </div>

                      {/* Duties */}
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Duties & Taxes</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>Customs Duty ($)</label>
                            <input type="number" step="0.01" value={com.duties_customs} onChange={(e) => updateCommodity(inv.id, com.id, "duties_customs", e.target.value)} className={inputClass} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={labelClass}>Excise Duties ($)</label>
                            <input type="number" step="0.01" value={com.duties_excise} onChange={(e) => updateCommodity(inv.id, com.id, "duties_excise", e.target.value)} className={inputClass} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={labelClass}>GST ($)</label>
                            <input type="number" step="0.01" value={com.duties_gst} onChange={(e) => updateCommodity(inv.id, com.id, "duties_gst", e.target.value)} className={inputClass} placeholder="0.00" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={() => addCommodity(inv.id)}>
                    <Plus className="h-4 w-4 mr-1" /> Add another commodity
                  </Button>
                </div>
              ))}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => goToStep(1)}>← Previous</Button>
                <div className="flex gap-2">
                  <Button variant="outline"><Save className="h-4 w-4 mr-1" /> Save draft</Button>
                  <Button onClick={() => goToStep(3)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Validation errors */}
              {showValidation && validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">{validationErrors.length} validation error(s)</span>
                  </div>
                  {validationErrors.map((err, i) => (
                    <p key={i} className="text-sm text-red-600 ml-6">• {err}</p>
                  ))}
                </div>
              )}

              {/* General details summary */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">General Details</h3>
                  <button onClick={() => goToStep(1)} className="text-xs text-primary hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground block text-xs">Type</span><span className="font-medium">{general.declaration_type}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Transaction #</span><span className="font-mono">{general.transaction_number}</span></div>
                  <div><span className="text-muted-foreground block text-xs">CBSA Office</span><span>{cbsaOffices.find((o) => o.value === general.cbsa_office)?.label || "—"}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Mode of Transport</span><span>{modeOfTransport.find((m) => m.value === general.mode_of_transport)?.label || "—"}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Release Date</span><span>{general.release_date}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Gross Weight</span><span>{general.gross_weight_kg} kg</span></div>
                  <div><span className="text-muted-foreground block text-xs">Freight Charges</span><span>${general.freight_charges}</span></div>
                  <div><span className="text-muted-foreground block text-xs">CCN</span><span className="font-mono">{general.cargo_control_numbers.filter(Boolean).join(", ")}</span></div>
                </div>
              </div>

              {/* Invoice summary */}
              {invoices.map((inv, i) => (
                <div key={inv.id} className="bg-card rounded-xl border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Invoice #{i + 1}: {inv.invoice_number || inv.purchase_order || "—"}</h3>
                    <button onClick={() => goToStep(2)} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div><span className="text-muted-foreground block text-xs">Vendor</span>{inv.vendor_name || "—"}</div>
                    <div><span className="text-muted-foreground block text-xs">Country of Export</span>{inv.country_of_export || "—"}</div>
                    <div><span className="text-muted-foreground block text-xs">Commodities</span>{inv.commodities.length}</div>
                  </div>
                  {inv.commodities.map((com, j) => (
                    <div key={com.id} className="bg-accent/30 rounded-lg p-4 mb-2 text-sm">
                      <div className="font-medium mb-1">Commodity #{j + 1}: {com.narrative_description || "—"}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <span>HS: <span className="font-mono text-foreground">{com.classification_number}</span></span>
                        <span>Qty: {com.quantity} {com.unit_of_measure?.split(" - ")[0]}</span>
                        <span>Origin: {com.country_of_origin}</span>
                        <span>Value: ${com.value_for_currency} {com.currency?.split(" - ")[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Estimated Duties & Taxes */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h3 className="text-sm font-semibold mb-4">Estimated Declaration Duties and Taxes</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium">Remission</th>
                      <th className="text-right py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: "Customs duty", amount: totalDuties },
                      { type: "Anti-dumping", amount: 0 },
                      { type: "Countervailing", amount: 0 },
                      { type: "Excise duties", amount: totalExcise },
                      { type: "Excise tax", amount: 0 },
                      { type: "GST", amount: totalGST },
                      { type: "PST/HST", amount: 0 },
                      { type: "Surtax", amount: 0 },
                      { type: "Safeguard", amount: 0 },
                      { type: "SIMA", amount: 0 },
                    ].map((row) => (
                      <tr key={row.type} className="border-b border-border/50">
                        <td className="py-1.5">{row.type}</td>
                        <td className="text-right font-mono">{row.amount.toFixed(2)}</td>
                        <td className="text-right font-mono">0.00</td>
                        <td className="text-right font-mono">{row.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold border-t-2">
                      <td className="py-2">Total duties and taxes</td>
                      <td></td><td></td>
                      <td className="text-right font-mono">{totalAll.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Total interest</td>
                      <td></td><td></td>
                      <td className="text-right font-mono">0.00</td>
                    </tr>
                    <tr>
                      <td className="py-1">Total relief</td>
                      <td></td><td></td>
                      <td className="text-right font-mono">0.00</td>
                    </tr>
                    <tr className="font-bold text-base border-t-2">
                      <td className="py-2">Total duties and taxes with interest and relief</td>
                      <td></td><td></td>
                      <td className="text-right font-mono">${totalAll.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Certification */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="rounded border-border mt-0.5" />
                  <span className="text-sm">
                    I certify that the information provided in this declaration is true and correct. I understand that any false or misleading statement may result in penalties under the Customs Act.
                  </span>
                </label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => goToStep(2)}>← Previous</Button>
                <div className="flex gap-2">
                  <Button variant="outline"><Save className="h-4 w-4 mr-1" /> Save draft</Button>
                  <Button onClick={handleValidateAndSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Submit Declaration
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CADForm;
