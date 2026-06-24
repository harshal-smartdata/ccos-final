import { useState } from "react";
import { Plus, X, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type RequestForInfo,
  type ChatSender,
  emptyRequest,
  newChatMessage,
} from "@/contexts/OnboardingContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

interface Props {
  requests: RequestForInfo[];
  onChange: (requests: RequestForInfo[]) => void;
  /** Called when a brand-new request is added (A4.7 — client notified by system). */
  onRequestAdded?: () => void;
  /** Called when a message is posted, so the parent can log activity. */
  onMessage?: (sender: ChatSender, text: string) => void;
}

/** A4.7 — Requests for Information; each opens a chat thread with the client in a popup. */
export const RequestForInfoEditor = ({ requests, onChange, onRequestAdded, onMessage }: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<RequestForInfo>) =>
    onChange(requests.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = () => {
    const created = emptyRequest();
    onChange([...requests, created]);
    onRequestAdded?.();
    setOpenId(created.id); // open the chat popup straight away
  };
  const remove = (id: string) => onChange(requests.filter((r) => r.id !== id));

  const active = requests.find((r) => r.id === openId) ?? null;

  return (
    <div className="space-y-2">
      {requests.length === 0 && (
        <p className="text-sm text-muted-foreground">No requests for information.</p>
      )}
      {requests.map((r) => (
        <div key={r.id} className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <Checkbox
            checked={r.resolved}
            onCheckedChange={(v) => update(r.id, { resolved: Boolean(v) })}
            title="Mark resolved"
          />
          <button
            type="button"
            className="flex-1 text-left min-w-0"
            onClick={() => setOpenId(r.id)}
          >
            <div className={cn("text-sm truncate", r.resolved && "line-through text-muted-foreground")}>
              {r.text || "(untitled request)"}
            </div>
            <div className="text-xs text-muted-foreground">
              {r.createdAt} · {r.messages.length} message{r.messages.length === 1 ? "" : "s"}
            </div>
          </button>
          <Button type="button" variant="ghost" size="icon" title="Open chat" onClick={() => setOpenId(r.id)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(r.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Create request
      </Button>

      <RequestChatDialog
        request={active}
        onClose={() => setOpenId(null)}
        onUpdate={(patch) => active && update(active.id, patch)}
        onMessage={onMessage}
      />
    </div>
  );
};

function RequestChatDialog({
  request,
  onClose,
  onUpdate,
  onMessage,
}: {
  request: RequestForInfo | null;
  onClose: () => void;
  onUpdate: (patch: Partial<RequestForInfo>) => void;
  onMessage?: (sender: ChatSender, text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [sender, setSender] = useState<ChatSender>("Dominion");

  const send = () => {
    if (!request) return;
    const text = draft.trim();
    if (!text) return;
    onUpdate({ messages: [...request.messages, newChatMessage(sender, text)] });
    onMessage?.(sender, text);
    setDraft("");
  };

  return (
    <Dialog open={request !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request for Information</DialogTitle>
        </DialogHeader>

        {request && (
          <div className="space-y-3">
            {/* Subject */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={request.resolved}
                onCheckedChange={(v) => onUpdate({ resolved: Boolean(v) })}
                title="Mark resolved"
              />
              <input
                className={cn(FIELD, request.resolved && "line-through text-muted-foreground")}
                value={request.text}
                placeholder="Subject — what information is required from the client?"
                onChange={(e) => onUpdate({ text: e.target.value })}
              />
            </div>

            {/* Thread */}
            <div className="h-72 overflow-y-auto rounded-lg border bg-muted/20 p-3 space-y-2">
              {request.messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-24">
                  No messages yet. Start the conversation below.
                </p>
              ) : (
                request.messages.map((m) => {
                  const mine = m.sender === "Dominion";
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          mine ? "bg-primary text-primary-foreground" : "bg-background border",
                        )}
                      >
                        <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
                          {m.sender} · {fmt(m.at)}
                        </div>
                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border overflow-hidden text-xs">
                {(["Dominion", "Client"] as ChatSender[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSender(s)}
                    className={cn(
                      "px-2.5 py-2",
                      sender === s ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                className={FIELD}
                value={draft}
                placeholder={`Message as ${sender}…`}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                autoFocus
              />
              <Button type="button" size="icon" onClick={send} disabled={!draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RequestForInfoEditor;
