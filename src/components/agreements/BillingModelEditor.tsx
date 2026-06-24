import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type BillingModel,
  type BillingKind,
  type FixedPriceBillingType,
  type TieredBillingType,
  type AccumulatedTier,
  type LineLevelTier,
  type Milestone,
  emptyBillingModel,
} from "@/contexts/AgreementContext";
import FieldSelect from "./FieldSelect";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
const RO = FIELD + " bg-muted text-muted-foreground";

const KINDS: { kind: BillingKind; label: string }[] = [
  { kind: "fixed_price", label: "Fixed Price" },
  { kind: "bundled_hours", label: "Bundled Hours" },
  { kind: "tiered", label: "Tiered" },
  { kind: "retainer", label: "Retainer" },
  { kind: "milestone", label: "Milestone" },
];

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.floor(Math.random() * 1e9).toString(36)}`;

interface Props {
  open: boolean;
  initial: BillingModel | null; // null = create new
  onSave: (model: BillingModel) => void;
  onClose: () => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-medium text-muted-foreground">{children}</label>
);

export const BillingModelEditor = ({ open, initial, onSave, onClose }: Props) => {
  const [model, setModel] = useState<BillingModel>(initial ?? emptyBillingModel("fixed_price"));
  const isEdit = Boolean(initial);

  // re-seed when the sheet is (re)opened with a different model
  const [seenKey, setSeenKey] = useState<string | null>(null);
  const key = (initial?.id ?? "new") + String(open);
  if (open && seenKey !== key) {
    setModel(initial ?? emptyBillingModel("fixed_price"));
    setSeenKey(key);
  }

  const set = (patch: Partial<BillingModel>) => setModel((m) => ({ ...m, ...patch }));
  const num = (v: string) => (v === "" ? undefined : Number(v));

  const pickKind = (kind: BillingKind) => {
    if (isEdit) return; // locked in edit
    setModel({ ...emptyBillingModel(kind), label: model.label, currency: model.currency });
  };

  const save = () => {
    if (!model.label.trim()) return;
    onSave(model);
  };

  // computed amounts
  const fixedHourlyAmount = (model.rate ?? 0) * (model.estHoursCount ?? model.hoursCount ?? 0);
  const bundledAmount = (model.purchasedHours ?? 0) * (model.ratePerHour ?? 0);
  const milestoneTotal = (model.milestones ?? []).reduce((s, m) => s + (m.value || 0), 0);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Billing Model" : "Add Billing Model"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Kind selector */}
          <div>
            <Label>Kind</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {KINDS.map((k) => (
                <button
                  key={k.kind}
                  type="button"
                  disabled={isEdit}
                  onClick={() => pickKind(k.kind)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                    model.kind === k.kind
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  } ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shared */}
          <div>
            <Label>Label *</Label>
            <input className={FIELD} value={model.label} onChange={(e) => set({ label: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Currency</Label>
              <FieldSelect value={model.currency} onChange={(v) => set({ currency: v as BillingModel["currency"] })} options={["USD", "CAD"]} />
            </div>
            <div>
              <Label>Est. Hours Count</Label>
              <input type="number" className={FIELD} value={model.estHoursCount ?? ""} onChange={(e) => set({ estHoursCount: num(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <FieldSelect value={model.status} onChange={(v) => set({ status: v as BillingModel["status"] })} options={["Active", "Draft", "Exhausted", "Closed"]} />
          </div>

          {/* Per-kind */}
          {model.kind === "fixed_price" && (
            <FixedPriceFields model={model} set={set} num={num} amount={fixedHourlyAmount} />
          )}
          {model.kind === "bundled_hours" && (
            <BundledFields model={model} set={set} num={num} amount={bundledAmount} />
          )}
          {model.kind === "tiered" && <TieredFields model={model} set={set} num={num} />}
          {model.kind === "retainer" && <RetainerFields model={model} set={set} num={num} />}
          {model.kind === "milestone" && (
            <MilestoneFields model={model} set={set} num={num} total={milestoneTotal} />
          )}

          <div>
            <Label>Notes</Label>
            <textarea className={FIELD} rows={2} value={model.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!model.label.trim()}>Save Model</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

type SubProps = {
  model: BillingModel;
  set: (patch: Partial<BillingModel>) => void;
  num: (v: string) => number | undefined;
};

const FixedPriceFields = ({ model, set, num, amount }: SubProps & { amount: number }) => (
  <div className="space-y-3 border-t pt-3">
    <div>
      <Label>Billing Type</Label>
      <FieldSelect
        value={model.fixedPriceType ?? ""}
        onChange={(v) => set({ fixedPriceType: v as FixedPriceBillingType })}
        options={["Hourly", "Percentage", "Project", "Priority"]}
      />
    </div>
    {model.fixedPriceType === "Hourly" && (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Rate</Label>
          <input type="number" className={FIELD} value={model.rate ?? ""} onChange={(e) => set({ rate: num(e.target.value) })} />
        </div>
        <div>
          <Label>Amount (rate × hours)</Label>
          <input className={RO} readOnly value={amount} />
        </div>
      </div>
    )}
    {model.fixedPriceType === "Percentage" && (
      <div>
        <Label>Percentage (0–100)</Label>
        <input type="number" min={0} max={100} className={FIELD} value={model.percentage ?? ""} onChange={(e) => set({ percentage: num(e.target.value) })} />
      </div>
    )}
    {model.fixedPriceType === "Project" && (
      <div>
        <Label>Amount (flat)</Label>
        <input type="number" className={FIELD} value={model.amount ?? ""} onChange={(e) => set({ amount: num(e.target.value) })} />
      </div>
    )}
    {model.fixedPriceType === "Priority" && (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Amount</Label>
          <input type="number" className={FIELD} value={model.amount ?? ""} onChange={(e) => set({ amount: num(e.target.value) })} />
        </div>
        <div>
          <Label>Priority Hours</Label>
          <input type="number" className={FIELD} value={model.hoursCount ?? ""} onChange={(e) => set({ hoursCount: num(e.target.value) })} />
        </div>
      </div>
    )}
  </div>
);

const BundledFields = ({ model, set, num, amount }: SubProps & { amount: number }) => (
  <div className="grid grid-cols-2 gap-3 border-t pt-3">
    <div><Label>BTB Count</Label><input type="number" className={FIELD} value={model.btbCount ?? ""} onChange={(e) => set({ btbCount: num(e.target.value) })} /></div>
    <div><Label>Hours per BTB</Label><input type="number" className={FIELD} value={model.hoursPerBtb ?? ""} onChange={(e) => set({ hoursPerBtb: num(e.target.value) })} /></div>
    <div><Label>Rate per Bundle/Hour</Label><input type="number" className={FIELD} value={model.ratePerHour ?? ""} onChange={(e) => set({ ratePerHour: num(e.target.value) })} /></div>
    <div><Label>Purchased Hours</Label><input type="number" className={FIELD} value={model.purchasedHours ?? ""} onChange={(e) => set({ purchasedHours: num(e.target.value) })} /></div>
    <div><Label>Amount</Label><input className={RO} readOnly value={amount} /></div>
    <div><Label>Threshold %</Label><input type="number" className={FIELD} value={model.thresholdPct ?? ""} onChange={(e) => set({ thresholdPct: num(e.target.value) })} /></div>
  </div>
);

const TieredFields = ({ model, set, num }: SubProps) => {
  const genId2 = () => `t-${Math.floor(Math.random() * 1e9).toString(36)}`;
  const accTiers = model.accumulatedTiers ?? [];
  const llTiers = model.lineLevelTiers ?? [];

  const updateAcc = (id: string, patch: Partial<AccumulatedTier>) =>
    set({ accumulatedTiers: accTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const updateLl = (id: string, patch: Partial<LineLevelTier>) =>
    set({ lineLevelTiers: llTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) });

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Tiered Billing Type</Label>
        <FieldSelect
          value={model.tieredType ?? ""}
          onChange={(v) => set({ tieredType: v as TieredBillingType })}
          options={[
            { value: "Accumulated", label: "Accumulated (Reset Date Based)" },
            { value: "LineLevel", label: "Line-Level (No Reset Date)" },
          ]}
        />
      </div>

      {model.tieredType === "Accumulated" && (
        <div className="space-y-2">
          {accTiers.map((t) => (
            <div key={t.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <div><Label>%</Label><input type="number" className={FIELD} value={t.percentage} onChange={(e) => updateAcc(t.id, { percentage: Number(e.target.value) })} /></div>
              <div><Label>From</Label><input type="number" className={FIELD} value={t.from} onChange={(e) => updateAcc(t.id, { from: Number(e.target.value) })} /></div>
              <div><Label>To (blank=∞)</Label><input type="number" className={FIELD} value={t.to ?? ""} onChange={(e) => updateAcc(t.id, { to: e.target.value === "" ? null : Number(e.target.value) })} /></div>
              <Button type="button" variant="ghost" size="icon" onClick={() => set({ accumulatedTiers: accTiers.filter((x) => x.id !== t.id) })}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set({ accumulatedTiers: [...accTiers, { id: genId2(), percentage: 0, from: 0, to: null }] })}>
            <Plus className="h-4 w-4 mr-1" /> Add tier
          </Button>
        </div>
      )}

      {model.tieredType === "LineLevel" && (
        <div className="space-y-2">
          <div>
            <Label>Adjustment Type</Label>
            <input className={FIELD} value={model.adjustmentType ?? ""} onChange={(e) => set({ adjustmentType: e.target.value })} />
          </div>
          {llTiers.map((t) => (
            <div key={t.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <div><Label>%</Label><input type="number" className={FIELD} value={t.percentage} onChange={(e) => updateLl(t.id, { percentage: Number(e.target.value) })} /></div>
              <div><Label>Threshold</Label><input type="number" className={FIELD} value={t.threshold} onChange={(e) => updateLl(t.id, { threshold: Number(e.target.value) })} /></div>
              <Button type="button" variant="ghost" size="icon" onClick={() => set({ lineLevelTiers: llTiers.filter((x) => x.id !== t.id) })}><X className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set({ lineLevelTiers: [...llTiers, { id: genId2(), percentage: 0, threshold: 0 }] })}>
            <Plus className="h-4 w-4 mr-1" /> Add tier
          </Button>
        </div>
      )}
    </div>
  );
};

const RetainerFields = ({ model, set, num }: SubProps) => (
  <div className="grid grid-cols-2 gap-3 border-t pt-3">
    <div><Label>Amount</Label><input type="number" className={FIELD} value={model.amount ?? ""} onChange={(e) => set({ amount: num(e.target.value) })} /></div>
    <div><Label>Total Hours</Label><input type="number" className={FIELD} value={model.hoursCount ?? ""} onChange={(e) => set({ hoursCount: num(e.target.value) })} /></div>
    <div className="col-span-2">
      <Label>Cadence</Label>
      <FieldSelect
        value={model.cadence ?? ""}
        onChange={(v) => set({ cadence: v as BillingModel["cadence"] })}
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "Quarterly" },
          { value: "yearly", label: "Yearly" },
        ]}
      />
    </div>
  </div>
);

const MilestoneFields = ({ model, set, total }: SubProps & { total: number }) => {
  const ms = model.milestones ?? [];
  const update = (id: string, patch: Partial<Milestone>) =>
    set({ milestones: ms.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Load Template</Label>
        <FieldSelect
          value={model.milestoneTemplate ?? ""}
          onChange={(v) => set({ milestoneTemplate: v })}
          placeholder="— None —"
          options={[
            { value: "standard", label: "Standard (25/25/25/25)" },
            { value: "halves", label: "Halves (50/50)" },
          ]}
        />
      </div>
      {ms.map((m) => (
        <div key={m.id} className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-2 items-end">
          <div><Label>Label</Label><input className={FIELD} value={m.label} onChange={(e) => update(m.id, { label: e.target.value })} /></div>
          <div>
            <Label>Value Type</Label>
            <FieldSelect
              value={m.valueType}
              onChange={(v) => update(m.id, { valueType: v as Milestone["valueType"] })}
              options={["Percent", "Amount"]}
            />
          </div>
          <div><Label>Value</Label><input type="number" className={FIELD} value={m.value} onChange={(e) => update(m.id, { value: Number(e.target.value) })} /></div>
          <Button type="button" variant="ghost" size="icon" onClick={() => set({ milestones: ms.filter((x) => x.id !== m.id) })}><X className="h-4 w-4" /></Button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={() => set({ milestones: [...ms, { id: genId(), label: "", valueType: "Percent", value: 0 }] })}>
          <Plus className="h-4 w-4 mr-1" /> Add milestone
        </Button>
        <span className="text-xs px-2 py-1 rounded bg-muted">Total Value: {total}</span>
      </div>
    </div>
  );
};

export default BillingModelEditor;
