import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type ChecklistItem, emptyChecklistItem } from "@/contexts/AgreementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

interface Props {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export const ChecklistEditor = ({ items, onChange }: Props) => {
  const update = (id: string, patch: Partial<ChecklistItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const add = () => onChange([...items, emptyChecklistItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No checklist items yet.</p>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox
            checked={item.done}
            onCheckedChange={(v) => update(item.id, { done: Boolean(v) })}
          />
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
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add item
      </Button>
    </div>
  );
};

export default ChecklistEditor;
