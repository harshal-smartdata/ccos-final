import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, ClipboardList, ArrowLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useMasters } from "@/contexts/MastersContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

type View = "landing" | "serviceTypes";

/**
 * Masters — landing page listing the available master data sets. Each master opens
 * its own management screen. Currently: Service Types (and their onboarding
 * data-collection checklist templates, flowchart A4.2 / A4.3).
 */
export default function MastersPage() {
  const [view, setView] = useState<View>("landing");
  const { serviceTemplates } = useMasters();

  if (view === "serviceTypes") {
    return <ServiceTypesMaster onBack={() => setView("landing")} />;
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Masters"
        description="Manage the reference data that drives the application."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setView("serviceTypes")}
          className="group text-left border rounded-xl p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Layers className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Service Type</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Service types &amp; their onboarding checklist templates
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {serviceTemplates.length} service type(s)
              </div>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Service Types master ───────────────────────────────────────────
function ServiceTypesMaster({ onBack }: { onBack: () => void }) {
  const {
    serviceTemplates,
    addServiceTemplate,
    updateServiceTemplate,
    deleteServiceTemplate,
  } = useMasters();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(
    serviceTemplates[0]?.id ?? null,
  );
  const [newItem, setNewItem] = useState("");

  const selected = serviceTemplates.find((t) => t.id === selectedId) ?? null;

  const addType = () => {
    const created = addServiceTemplate("New Service Type", []);
    setSelectedId(created.id);
    toast({ title: "Service type added" });
  };

  const removeType = (id: string) => {
    deleteServiceTemplate(id);
    if (selectedId === id) {
      setSelectedId(serviceTemplates.find((t) => t.id !== id)?.id ?? null);
    }
    toast({ title: "Service type deleted" });
  };

  // ── Checklist item editing (operates on the selected template) ──────
  const setItems = (items: string[]) =>
    selected && updateServiceTemplate(selected.id, { items });

  const addItem = () => {
    if (!selected || !newItem.trim()) return;
    setItems([...selected.items, newItem.trim()]);
    setNewItem("");
  };

  const editItem = (i: number, text: string) =>
    selected && setItems(selected.items.map((it, j) => (j === i ? text : it)));

  const deleteItem = (i: number) =>
    selected && setItems(selected.items.filter((_, j) => j !== i));

  const move = (i: number, dir: -1 | 1) => {
    if (!selected) return;
    const j = i + dir;
    if (j < 0 || j >= selected.items.length) return;
    const items = [...selected.items];
    [items[i], items[j]] = [items[j], items[i]];
    setItems(items);
  };

  return (
    <div className="p-6">
      <button
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Masters
      </button>

      <PageHeader
        title="Service Types"
        description="Manage service types and their onboarding data-collection checklist templates. Changes apply to new onboardings only."
        actions={
          <Button onClick={addType}>
            <Plus className="h-4 w-4 mr-1" /> Add Service Type
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Service type list */}
        <div className="space-y-2">
          {serviceTemplates.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
              No service types yet. Add one to get started.
            </div>
          ) : (
            serviceTemplates.map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between border rounded-lg px-3 py-2 ${
                  t.id === selectedId ? "border-primary bg-primary/5" : ""
                }`}
              >
                <button
                  className="text-left flex-1"
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.items.length} checklist item(s)
                  </div>
                </button>
                <Button variant="ghost" size="icon" onClick={() => removeType(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Selected template editor */}
        <div className="md:col-span-2">
        {!selected ? (
          <div className="border rounded-xl p-12 text-center text-muted-foreground">
            Select a service type to edit its checklist template.
          </div>
        ) : (
          <section className="border rounded-xl p-5 space-y-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Service Type Name
              </label>
              <input
                className={`${FIELD} mt-1`}
                value={selected.label}
                onChange={(e) =>
                  updateServiceTemplate(selected.id, { label: e.target.value })
                }
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 border-b pb-2 flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> Checklist Questions
              </h3>

              {selected.items.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-3">
                  No questions yet. Add the first one below.
                </p>
              ) : (
                <ul className="space-y-2 mb-3">
                  {selected.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5 text-right">
                        {i + 1}.
                      </span>
                      <input
                        className={FIELD}
                        value={item}
                        onChange={(e) => editItem(i, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={i === selected.items.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-2">
                <input
                  className={FIELD}
                  placeholder="New checklist question…"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
                <Button onClick={addItem} disabled={!newItem.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </section>
        )}
        </div>
      </div>
    </div>
  );
}
