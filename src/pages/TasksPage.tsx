import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ListTodo, LayoutGrid, Plus } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";

type TaskStatus = "Pending" | "In Progress" | "Waiting" | "Completed";

interface Task {
  id: string;
  title: string;
  assignee: string;
  client: string;
  priority: string;
  priorityV: "danger" | "warning" | "neutral";
  status: TaskStatus;
  statusV: "neutral" | "info" | "warning" | "success";
  due: string;
}

const tasks: Task[] = [
  { id: "1", title: "Validate HS codes for Toronto Tech Solutions shipment", assignee: "Sarah Chen", client: "Toronto Tech Solutions (TTS-001)", priority: "High", priorityV: "danger", status: "In Progress", statusV: "info", due: "Today" },
  { id: "2", title: "Complete B2 adjustment for Vancouver Logistics", assignee: "Sarah Chen", client: "Vancouver Logistics Ltd. (VLL-002)", priority: "High", priorityV: "danger", status: "Pending", statusV: "neutral", due: "Today" },
  { id: "3", title: "Review duty calculation — Pacific Customs", assignee: "Mike Johnson", client: "Montreal Wholesale Inc. (MWI-003)", priority: "Medium", priorityV: "warning", status: "Waiting", statusV: "warning", due: "Tomorrow" },
  { id: "4", title: "Upload customs data for Atlantic Freight", assignee: "Lisa Park", client: "Atlantic Freight", priority: "Low", priorityV: "neutral", status: "Pending", statusV: "neutral", due: "Apr 18" },
  { id: "5", title: "Prepare monthly compliance report", assignee: "Sarah Chen", client: "—", priority: "Medium", priorityV: "warning", status: "Completed", statusV: "success", due: "Apr 15" },
];

const statuses: TaskStatus[] = ["Pending", "In Progress", "Waiting", "Completed"];

const TasksPage = () => {
  const [view, setView] = useState<"table" | "kanban">("table");
  const { role } = useRole();
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex-shrink-0">
        <PageHeader
          title="Tasks"
          description="Track and manage your compliance workflow."
          actions={
            <div className="flex items-center gap-3">
              {(role === "manager" || role === "consultant") && (
                <Button onClick={() => navigate("/tasks/new")} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              )}
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                <button
                  onClick={() => setView("table")}
                  className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <ListTodo className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("kanban")}
                  className={`p-1.5 rounded-md transition-colors ${view === "kanban" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          }
        />
      </div>

      {view === "table" ? (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1">
            <table className="data-table">
              <thead className="sticky top-0 bg-muted/50 z-10 shadow-sm">
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Client</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate(`/tasks/${t.id}/edit`)}>
                    <td className="font-medium max-w-xs truncate">{t.title}</td>
                    <td>{t.assignee}</td>
                    <td className="text-muted-foreground">{t.client}</td>
                    <td><StatusBadge label={t.priority} variant={t.priorityV} /></td>
                    <td><StatusBadge label={t.status} variant={t.statusV} /></td>
                    <td className={t.due === "Today" ? "text-destructive font-medium" : "text-muted-foreground"}>{t.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-x-hidden overflow-y-auto min-h-0 pb-6">
          {statuses.map((status) => (
            <div key={status} className="bg-card rounded-xl border p-4 flex flex-col h-full overflow-hidden">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 flex-shrink-0">
                {status}
                <span className="text-xs text-muted-foreground font-normal bg-secondary px-2 rounded-full">
                  {tasks.filter((t) => t.status === status).length}
                </span>
              </h3>
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {tasks
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <div key={t.id} className="p-3 rounded-lg border bg-background hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/tasks/${t.id}/edit`)}>
                      <p className="text-sm font-medium leading-snug">{t.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge label={t.priority} variant={t.priorityV} />
                        <span className="text-xs text-muted-foreground">{t.due}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
