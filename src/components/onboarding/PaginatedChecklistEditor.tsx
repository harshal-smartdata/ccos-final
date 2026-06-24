import { useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type ChecklistItem, emptyChecklistItem } from "@/contexts/AgreementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

interface Props {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  pageSize?: number;
}

/** Checklist editor with pagination — edits items by id so paging never loses data. */
export const PaginatedChecklistEditor = ({ items, onChange, pageSize = 5 }: Props) => {
  const [page, setPage] = useState(0);

  const update = (id: string, patch: Partial<ChecklistItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => {
    const updated = [...items, emptyChecklistItem()];
    onChange(updated);
    setPage(Math.floor((updated.length - 1) / pageSize)); // jump to the page with the new item
  };

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const start = current * pageSize;
  const visible = items.slice(start, start + pageSize);

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground">No checklist items yet.</p>}

      {visible.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox checked={item.done} onCheckedChange={(v) => update(item.id, { done: Boolean(v) })} />
          <input
            className={FIELD}
            value={item.text}
            placeholder="Checklist item"
            onChange={(e) => update(item.id, { text: e.target.value })}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(item.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add item
        </Button>

        {items.length > pageSize && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {current + 1} of {pageCount}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginatedChecklistEditor;
