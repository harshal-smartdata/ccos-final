import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const requests = [
  { id: "REQ-0045", subject: "Request HS code review for new product line", status: "Open", statusV: "info" as const, updated: "2 hours ago", messages: 3 },
  { id: "REQ-0044", subject: "Inquiry about duty refund timeline", status: "Awaiting Response", statusV: "warning" as const, updated: "1 day ago", messages: 5 },
  { id: "REQ-0043", subject: "Update supplier information", status: "Resolved", statusV: "success" as const, updated: "3 days ago", messages: 8 },
];

const RequestsPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="My Requests"
        description="Submit and track your requests."
        actions={
          <Button size="sm" onClick={() => navigate("/requests/new")}><Plus className="h-4 w-4 mr-1" /> New Request</Button>
        }
      />

      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="bg-card rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                  <StatusBadge label={req.status} variant={req.statusV} />
                </div>
                <h3 className="text-sm font-medium">{req.subject}</h3>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">{req.messages}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Updated {req.updated}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestsPage;
