import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, FileText, Users, Package } from "lucide-react";

const tabs = ["Overview", "Linked Clients", "CADs", "Shipments"];

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div>


      <PageHeader
        title="Supplier 1"
        description="China · Active"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/suppliers/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Linked Clients</span></div>
          <p className="text-xl font-semibold">3</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Total CADs</span></div>
          <p className="text-xl font-semibold">18</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-1"><Package className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Shipments</span></div>
          <p className="text-xl font-semibold">42</p>
        </div>
      </div>

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
            <h3 className="text-sm font-semibold mb-4">Supplier Information</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">Supplier 1</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Country</dt><dd>China</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Vendor Address</dt><dd>88 Industrial Rd, Shanghai</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><StatusBadge label="Active" variant="success" /></dd></div>
            </dl>
          </div>
          <div className="bg-card rounded-xl border shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-4">Contact</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Contact</dt><dd>Consultant 1</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>contact@supplier1.cn</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>+86 21 5555 0123</dd></div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === "Linked Clients" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Client</th><th>CADs</th><th>Last Shipment</th><th>Status</th></tr></thead>
            <tbody>
              <tr className="cursor-pointer"><td className="font-medium">Toronto Tech Solutions (TTS-001)</td><td>8</td><td className="text-muted-foreground">Apr 12, 2026</td><td><StatusBadge label="Active" variant="success" /></td></tr>
              <tr className="cursor-pointer"><td className="font-medium">Montreal Wholesale Inc. (MWI-003)</td><td>6</td><td className="text-muted-foreground">Apr 8, 2026</td><td><StatusBadge label="Active" variant="success" /></td></tr>
              <tr className="cursor-pointer"><td className="font-medium">Atlantic Freight</td><td>4</td><td className="text-muted-foreground">Mar 28, 2026</td><td><StatusBadge label="Active" variant="success" /></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "CADs" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="data-table">
            <thead><tr><th>CAD ID</th><th>Client</th><th>HS Code</th><th>Status</th><th>Duty</th></tr></thead>
            <tbody>
              <tr className="cursor-pointer"><td className="font-medium text-primary">CAD-2024-0891</td><td>Toronto Tech Solutions (TTS-001)</td><td className="font-mono text-xs">7208.51</td><td><StatusBadge label="Pending Review" variant="warning" /></td><td>$4,230</td></tr>
              <tr className="cursor-pointer"><td className="font-medium text-primary">CAD-2024-0888</td><td>Atlantic Freight</td><td className="font-mono text-xs">7306.30</td><td><StatusBadge label="Error" variant="danger" /></td><td>$6,780</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Shipments" && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Shipment</th><th>Client</th><th>Items</th><th>Value</th><th>Date</th></tr></thead>
            <tbody>
              <tr><td className="font-mono text-xs">SHP-2024-0445</td><td>Toronto Tech Solutions (TTS-001)</td><td>5,000 units</td><td>$62,500</td><td className="text-muted-foreground">Apr 12, 2026</td></tr>
              <tr><td className="font-mono text-xs">SHP-2024-0432</td><td>Montreal Wholesale Inc. (MWI-003)</td><td>3,200 units</td><td>$41,600</td><td className="text-muted-foreground">Apr 5, 2026</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupplierDetail;
