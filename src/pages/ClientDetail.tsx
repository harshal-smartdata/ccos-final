import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, FileText, ArrowLeftRight, Receipt, Clock } from "lucide-react";

const tabs = ["Overview", "CADs", "Adjustments", "Billing", "Activity"];

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div>


      <PageHeader
        title="Toronto Tech Solutions (TTS-001)"
        description="BN-123456789 · Active since Jan 2024"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Active CADs</span></div>
          <p className="text-xl font-semibold">12</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><ArrowLeftRight className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Adjustments</span></div>
          <p className="text-xl font-semibold">4</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><Receipt className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Total Billed</span></div>
          <p className="text-xl font-semibold">$24,500</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Outstanding</span></div>
          <p className="text-xl font-semibold">$1,340</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors ${activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-4">Business Information</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Business Name</dt><dd className="font-medium">Toronto Tech Solutions (TTS-001)</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Business Number</dt><dd className="font-mono">BN-123456789</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Contact</dt><dd>John Smith</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>john@torontotech.ca</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>+1 (416) 555-0123</dd></div>
            </dl>
          </div>
          <div className="bg-card rounded-xl border shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-4">Billing Configuration</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Billing Type</dt><dd><StatusBadge label="Fixed" variant="info" /></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Rate</dt><dd className="font-medium">$250.00 / entry</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Payment Terms</dt><dd>Net 30</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><StatusBadge label="Active" variant="success" /></dd></div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === "CADs" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="data-table">
            <thead><tr><th>CAD ID</th><th>Supplier</th><th>HS Code</th><th>Status</th><th>Duty</th><th>Date</th></tr></thead>
            <tbody>
              <tr className="cursor-pointer"><td className="font-medium text-primary">CAD-2024-0891</td><td>Shanghai Metals Ltd.</td><td className="font-mono text-xs">7208.51</td><td><StatusBadge label="Pending Review" variant="warning" /></td><td>$4,230</td><td className="text-muted-foreground">Apr 14, 2026</td></tr>
              <tr className="cursor-pointer"><td className="font-medium text-primary">CAD-2024-0886</td><td>Korea Electronics</td><td className="font-mono text-xs">8542.31</td><td><StatusBadge label="Approved" variant="success" /></td><td>$3,450</td><td className="text-muted-foreground">Apr 10, 2026</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Adjustments" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Adjustment ID</th><th>CAD Ref</th><th>Type</th><th>Status</th><th>Refund</th></tr></thead>
            <tbody>
              <tr className="cursor-pointer"><td className="font-medium text-primary">ADJ-2024-0233</td><td className="font-mono text-xs">CAD-2024-0865</td><td>B2 Adjustment</td><td><StatusBadge label="Approved" variant="success" /></td><td>$5,120</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              <tr><td className="font-medium text-primary">INV-0456</td><td>$2,150</td><td><StatusBadge label="Paid" variant="success" /></td><td className="text-muted-foreground">Apr 14, 2026</td></tr>
              <tr><td className="font-medium text-primary">INV-0441</td><td>$1,800</td><td><StatusBadge label="Paid" variant="success" /></td><td className="text-muted-foreground">Mar 14, 2026</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Activity" && (
        <div className="bg-card rounded-xl border shadow-sm p-5">
          <div className="space-y-4">
            {[
              { text: "CAD-2024-0891 created and assigned to Sarah Chen", time: "2 hours ago", user: "System" },
              { text: "Invoice INV-0456 sent and paid", time: "Yesterday", user: "James Wilson" },
              { text: "B2 Adjustment ADJ-0233 approved — $5,120 refund", time: "3 days ago", user: "CARM" },
              { text: "Client contact updated", time: "1 week ago", user: "Sarah Chen" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  {i < 3 && <div className="flex-1 w-px bg-border mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time} · {item.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
