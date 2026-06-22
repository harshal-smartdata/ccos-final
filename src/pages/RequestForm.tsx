import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Upload } from "lucide-react";

const categories = ["CAD Adjustment Request", "Compliance Review", "Refund Inquiry", "General Question", "Document Request"];
const requestPriorities = ["Low", "Medium", "High"];

const RequestForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    priority: "Medium",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-3xl">


      <PageHeader title="Submit New Request" description="Send a request to your customs compliance team." />

      <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Category *</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Priority</label>
            <select value={form.priority} onChange={(e) => update("priority", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              {requestPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Subject *</label>
          <input value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Brief summary of your request" />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Description *</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Provide details about your request..." />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Attachments</h3>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Drag & drop files or click to browse</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" onClick={() => navigate("/requests")}>Cancel</Button>
          <Button><Save className="h-4 w-4 mr-1" /> Submit Request</Button>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
