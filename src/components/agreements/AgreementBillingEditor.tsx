import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type BillingModel } from "@/contexts/AgreementContext";
import BillingModelEditor from "./BillingModelEditor";

const KIND_LABEL: Record<BillingModel["kind"], string> = {
  fixed_price: "Fixed Price",
  bundled_hours: "Bundled Hours",
  tiered: "Tiered",
  retainer: "Retainer",
  milestone: "Milestone",
};

interface Props {
  models: BillingModel[];
  onChange: (models: BillingModel[]) => void;
}

export const AgreementBillingEditor = ({ models, onChange }: Props) => {
  const [editing, setEditing] = useState<BillingModel | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (m: BillingModel) => {
    setEditing(m);
    setOpen(true);
  };

  const save = (model: BillingModel) => {
    const exists = models.some((m) => m.id === model.id);
    onChange(exists ? models.map((m) => (m.id === model.id ? model : m)) : [...models, model]);
    setOpen(false);
  };

  const remove = (id: string) => onChange(models.filter((m) => m.id !== id));

  return (
    <div className="space-y-3">
      {models.length === 0 && <p className="text-sm text-muted-foreground">No billing models added.</p>}

      <div className="space-y-2">
        {models.map((m) => (
          <div key={m.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
            <div>
              <div className="text-sm font-medium">{m.label || "(untitled)"}</div>
              <div className="text-xs text-muted-foreground">
                {KIND_LABEL[m.kind]} · {m.currency} · {m.status}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(m)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(m.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={openNew}>
        <Plus className="h-4 w-4 mr-1" /> Add billing model
      </Button>

      <BillingModelEditor open={open} initial={editing} onSave={save} onClose={() => setOpen(false)} />
    </div>
  );
};

export default AgreementBillingEditor;
