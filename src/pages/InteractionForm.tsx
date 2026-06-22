import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Calendar, User, FileText, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

const clients = ["Toronto Tech Solutions (TTS-001)", "Global Imports Ltd", "TechCorp Supply"];
const transactions = ["CAD-999021", "CAD-10332", "CAD-55411"];

export default function InteractionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    date: isEdit ? "2026-04-10" : "",
    type: isEdit ? "Email" : "Email",
    client: isEdit ? "Toronto Tech Solutions (TTS-001)" : "",
    transaction: isEdit ? "CAD-999021" : "",
    notes: isEdit ? "Followed up regarding missing commercial invoice." : "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/interactions");
  };

  const inputClass = "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const labelClass = "text-sm font-medium block mb-1.5 flex items-center gap-1.5 text-foreground/90";

  return (
    <div className="max-w-6xl w-full mx-auto flex flex-col gap-6">
      <div className="flex-shrink-0">


        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Interaction" : "Log New Interaction"}</h1>

        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border shadow-sm rounded-xl p-6 flex flex-col">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            
            <div className="space-y-1">
              <label className={labelClass}><Calendar className="h-4 w-4 text-muted-foreground" /> Date</label>
              <input type="date" required value={formData.date} onChange={e => updateField("date", e.target.value)} className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className={labelClass}><Type className="h-4 w-4 text-muted-foreground" /> Interaction Type</label>
              <select required value={formData.type} onChange={e => updateField("type", e.target.value)} className={inputClass}>
                <option value="Email">Email</option>
                <option value="Phone Call">Phone Call</option>
                <option value="In-person Meeting">In-person Meeting</option>
                <option value="Video Conference">Video Conference</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClass}><User className="h-4 w-4 text-muted-foreground" /> Client</label>
              <select required value={formData.client} onChange={e => updateField("client", e.target.value)} className={inputClass}>
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClass}><FileText className="h-4 w-4 text-muted-foreground" /> Linked Transaction (Optional)</label>
              <select value={formData.transaction} onChange={e => updateField("transaction", e.target.value)} className={inputClass}>
                <option value="">None</option>
                {transactions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">Associate this log with a specific CAD</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Notes / Description</label>
            <textarea 
              required 
              rows={5} 
              value={formData.notes} 
              onChange={e => updateField("notes", e.target.value)} 
              className={`${inputClass} resize-y min-h-[100px]`}
              placeholder="Summarize the interaction..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4 flex-shrink-0">
          <Button type="button" variant="outline" onClick={() => navigate("/interactions")}>Cancel</Button>
          <Button type="submit"><Save className="mr-2 h-4 w-4" /> {isEdit ? "Update Interaction" : "Save Interaction"}</Button>
        </div>
      </form>
    </div>
  );
}
