import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Send, CheckCircle2, FileText, Download, Paperclip } from "lucide-react";

const tabs = ["Overview", "Invoices & Commodities", "Duties & Taxes", "Validation", "History", "Submission Logs", "Attachments"];

const CADDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const statusSteps = [
    { label: "Draft", done: true },
    { label: "Validated", done: true },
    { label: "Submitted", done: false, active: true },
    { label: "Accepted", done: false },
  ];

  return (
    <div>


      <PageHeader
        title="CAD-2024-0891"
        description="Commercial Accounting Declaration — Type AB"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/cads/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm">
              <Send className="h-4 w-4 mr-1" /> Submit to CARM
            </Button>
          </div>
        }
      />

      {/* Status stepper */}
      <div className="bg-card rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2">
          {statusSteps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                s.done ? "bg-emerald-500 text-white" : s.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {s.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap ${s.done || s.active ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < statusSteps.length - 1 && <div className={`h-px flex-1 ${s.done ? "bg-emerald-400" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-4">General Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div><span className="text-muted-foreground block text-xs mb-0.5">Declaration Type</span><span className="font-medium">AB - With Release</span></div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Transaction #</span><span className="font-mono">99902151552125</span></div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">CBSA Office</span>0813 - Pacific Highway</div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Mode of Transport</span>02 - Highway</div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Release Date</span>2026-04-14</div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Cargo Control #</span><span className="font-mono">2145</span></div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Gross Weight</span>12,000 kg</div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Freight Charges</span>$2,500.00</div>
                <div><span className="text-muted-foreground block text-xs mb-0.5">Version</span>v1</div>
              </div>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-4">Parties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Importer</h4>
                  <p className="font-medium">Toronto Tech Solutions (TTS-001)</p>
                  <p className="text-muted-foreground">BN: 994893105RM0001</p>
                  <p className="text-muted-foreground">123 Trade St, Toronto, ON, M5V 2T6</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Vendor</h4>
                  <p className="font-medium">Shanghai Metals Ltd.</p>
                  <p className="text-muted-foreground">88 Industrial Rd, Shanghai 200000, China</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-3">Status</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><StatusBadge label="Submitted" variant="info" /></dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd>Apr 14, 2026</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Created by</dt><dd>Sarah Chen</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Last Updated</dt><dd>Apr 14, 2026</dd></div>
              </dl>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-3">Estimated Duties & Taxes</h3>
              <div className="text-2xl font-bold mb-3">$5,075.00 <span className="text-sm font-normal text-muted-foreground">CAD</span></div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Customs Duty</dt><dd className="font-mono">$4,230.00</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">GST</dt><dd className="font-mono">$845.00</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Interest</dt><dd className="font-mono">$0.00</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Relief</dt><dd className="font-mono">$0.00</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Invoices & Commodities */}
      {activeTab === "Invoices & Commodities" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-4">Invoice #1: 273637</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div><span className="text-muted-foreground block text-xs">Vendor</span>Shanghai Metals Ltd.</div>
              <div><span className="text-muted-foreground block text-xs">Country of Export</span>China</div>
              <div><span className="text-muted-foreground block text-xs">US Port of Exit</span>—</div>
              <div><span className="text-muted-foreground block text-xs">Purchaser ≠ Importer</span>No</div>
            </div>

            <div className="bg-accent/30 rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-3">Commodity #1: Hot-rolled steel coil</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-sm">
                <div><span className="text-muted-foreground block text-xs">Classification</span><span className="font-mono">7208.51.00.10</span></div>
                <div><span className="text-muted-foreground block text-xs">Description</span>Flat-rolled products of iron or non-alloy steel</div>
                <div><span className="text-muted-foreground block text-xs">Quantity</span>5,000 KGM</div>
                <div><span className="text-muted-foreground block text-xs">Value</span>$62,500.00 USD</div>
                <div><span className="text-muted-foreground block text-xs">Country of Origin</span>China</div>
                <div><span className="text-muted-foreground block text-xs">Tariff Treatment</span>002 - MFN</div>
                <div><span className="text-muted-foreground block text-xs">VFD Code</span>013</div>
                <div><span className="text-muted-foreground block text-xs">Direct Shipment</span>2026-04-01</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duties & Taxes */}
      {activeTab === "Duties & Taxes" && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-1">Estimated Declaration Duties and Taxes</h3>
          <p className="text-2xl font-bold mb-4">$5,075.00 <span className="text-sm font-normal text-muted-foreground">CAD</span></p>
          <div className="text-sm mb-4">
            <span className="text-muted-foreground">Value for duty:</span> <span className="font-mono font-medium">$62,500.00 CAD</span>
          </div>

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
                { type: "Anti-dumping", amount: 0 },
                { type: "Countervailing", amount: 0 },
                { type: "Customs duty", amount: 4230 },
                { type: "Excise duties", amount: 0 },
                { type: "Excise tax", amount: 0 },
                { type: "GST", amount: 845 },
                { type: "PST/HST", amount: 0 },
                { type: "Provincial alcohol tax", amount: 0 },
                { type: "Provincial cannabis excise duty", amount: 0 },
                { type: "Provincial tobacco tax", amount: 0 },
                { type: "Safeguard", amount: 0 },
                { type: "Surtax", amount: 0 },
              ].map((row) => (
                <tr key={row.type} className="border-b border-border/50">
                  <td className="py-1.5">{row.type}</td>
                  <td className="text-right font-mono">{row.amount.toFixed(2)}</td>
                  <td className="text-right font-mono">0.00</td>
                  <td className="text-right font-mono">{row.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-semibold border-t-2">
                <td className="py-2">Total duties and taxes</td><td></td><td></td>
                <td className="text-right font-mono">5,075.00</td>
              </tr>
              <tr><td className="py-1">Total interest</td><td></td><td></td><td className="text-right font-mono">0.00</td></tr>
              <tr><td className="py-1">Total relief</td><td></td><td></td><td className="text-right font-mono">0.00</td></tr>
              <tr className="font-bold text-base border-t-2">
                <td className="py-2">Total duties and taxes with interest and relief</td><td></td><td></td>
                <td className="text-right font-mono">$5,075.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Validation */}
      {activeTab === "Validation" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Validation Warnings</h3>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                SIMA flag: Anti-dumping duties may apply for steel products from China (HS 7208.51)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                Verify tariff rate with latest CARM schedule for this HS code
              </li>
            </ul>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-emerald-800 mb-2">Passed Checks</h3>
            <ul className="space-y-2 text-sm text-emerald-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> HS code format valid</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Client & supplier linked</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Duty calculation verified</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Required fields complete</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Transaction number valid</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> CBSA office valid</li>
            </ul>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === "History" && (
        <div className="bg-card rounded-xl border shadow-sm p-5">
          <div className="space-y-4">
            {[
              { text: "CAD created by Sarah Chen", time: "Apr 14, 2026 10:23 AM", version: "v1" },
              { text: "General details completed", time: "Apr 14, 2026 10:35 AM", version: "v1" },
              { text: "Invoice #273637 added with 1 commodity", time: "Apr 14, 2026 10:42 AM", version: "v1" },
              { text: "HS code set to 7208.51.00.10", time: "Apr 14, 2026 10:45 AM", version: "v1" },
              { text: "SIMA flag detected automatically", time: "Apr 14, 2026 10:45 AM", version: "v1" },
              { text: "Duty calculated: $4,230.00 + GST $845.00", time: "Apr 14, 2026 10:46 AM", version: "v1" },
              { text: "Validation passed with 2 warnings", time: "Apr 14, 2026 11:00 AM", version: "v1" },
              { text: "Declaration submitted to CARM", time: "Apr 14, 2026 11:05 AM", version: "v1" },
            ].map((item, i, arr) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  {i < arr.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
                </div>
                <div className="pb-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{item.text}</p>
                    <StatusBadge label={item.version} variant="neutral" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Logs */}
      {activeTab === "Submission Logs" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Timestamp</th><th>Action</th><th>Status</th><th>CARM Response</th></tr></thead>
            <tbody>
              <tr>
                <td className="font-mono text-xs">Apr 14, 2026 11:05:01</td>
                <td>Submit Declaration</td>
                <td><StatusBadge label="Submitted" variant="info" /></td>
                <td className="text-muted-foreground">Awaiting CARM acknowledgement</td>
              </tr>
              <tr>
                <td className="font-mono text-xs">Apr 14, 2026 11:05:03</td>
                <td>CARM ACK</td>
                <td><StatusBadge label="Received" variant="success" /></td>
                <td className="text-muted-foreground">Declaration received — processing</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Attachments */}
      {activeTab === "Attachments" && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Attachments</h3>
            <Button variant="outline" size="sm"><Paperclip className="h-4 w-4 mr-1" /> Add Attachment</Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">commercial_invoice_273637.pdf</p>
                  <p className="text-xs text-muted-foreground">245 KB · Uploaded Apr 14, 2026</p>
                </div>
              </div>
              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">bill_of_lading.pdf</p>
                  <p className="text-xs text-muted-foreground">180 KB · Uploaded Apr 14, 2026</p>
                </div>
              </div>
              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CADDetail;
