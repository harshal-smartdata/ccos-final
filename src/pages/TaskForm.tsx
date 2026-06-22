import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

const priorities = ["Low", "Medium", "High", "Critical"];
const taskStatuses = ["Pending", "In Progress", "Waiting on Client", "Submitted", "Approved", "Denied", "Completed"];
const entityTypes = ["CAD", "Adjustment", "Client"];

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, userName } = useRole();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: isEdit ? "Validate HS codes for Toronto Tech Solutions shipment" : "",
    description: isEdit ? "Review and validate HS code classifications for the latest batch of steel imports." : "",
    assigned_to: isEdit ? "Sarah Chen" : (role === "consultant" ? userName : ""),
    linked_entity_type: isEdit ? "CAD" : "",
    linked_entity_id: isEdit ? "CAD-2024-0891" : "",
    status: isEdit ? "In Progress" : "Pending",
    priority: isEdit ? "High" : "Medium",
    due_date: isEdit ? "2026-04-15" : "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-6xl mx-auto flex flex-col w-full">
      <div className="flex-shrink-0">


        <PageHeader
          title={isEdit ? "Edit Task" : "Create Task"}
          description=""
        />
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col">
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Task title" />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Describe the task..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1.5">Assigned To *</label>
              <select
                value={form.assigned_to}
                onChange={(e) => update("assigned_to", e.target.value)}
                disabled={role === "consultant"}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <option value="">Select assignee</option>
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Mike Johnson">Mike Johnson</option>
                <option value="Lisa Park">Lisa Park</option>
              </select>
              {role === "consultant" && (
                <p className="text-[10px] text-muted-foreground mt-1 text-right">Self-assigned automatically.</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => update("priority", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                {taskStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => update("due_date", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">Linked Entity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium block mb-1.5">Entity Type</label>
                <select value={form.linked_entity_type} onChange={(e) => update("linked_entity_type", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">None</option>
                  {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Entity ID</label>
                <input value={form.linked_entity_id} onChange={(e) => update("linked_entity_id", e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono" placeholder="e.g. CAD-2024-0891" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4 flex-shrink-0">
          <Button variant="outline" onClick={() => navigate("/tasks")}>Cancel</Button>
          <Button onClick={() => navigate("/tasks")}><Save className="h-4 w-4 mr-1" />{isEdit ? "Update Task" : "Create Task"}</Button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
