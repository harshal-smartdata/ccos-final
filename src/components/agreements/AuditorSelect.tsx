import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  workManagementReps,
  type AuditAllocation,
} from "@/contexts/AgreementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

const PAGE_SIZE = 5;

interface Props {
  auditors: string[];
  allocations: Record<string, AuditAllocation>;
  onChange: (auditors: string[], allocations: Record<string, AuditAllocation>) => void;
}

export const AuditorSelect = ({ auditors, allocations, onChange }: Props) => {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(workManagementReps.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = workManagementReps.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const toggle = (rep: string) => {
    if (auditors.includes(rep)) {
      const next = { ...allocations };
      delete next[rep];
      onChange(auditors.filter((r) => r !== rep), next);
    } else {
      onChange([...auditors, rep], { ...allocations, [rep]: {} });
    }
  };

  const setAlloc = (rep: string, patch: Partial<AuditAllocation>) =>
    onChange(auditors, { ...allocations, [rep]: { ...allocations[rep], ...patch } });

  const num = (v: string) => (v === "" ? undefined : Number(v));

  return (
    <div className="space-y-2">
      {visible.map((rep) => {
        const selected = auditors.includes(rep);
        return (
          <div key={rep} className="border rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selected} onCheckedChange={() => toggle(rep)} />
              <span className="text-sm">{rep}</span>
            </label>
            {selected && (
              <div className="grid grid-cols-2 gap-2 mt-2 pl-6">
                <div>
                  <label className="text-xs text-muted-foreground">Hourly Rate</label>
                  <input
                    type="number"
                    className={FIELD}
                    value={allocations[rep]?.hourlyRate ?? ""}
                    onChange={(e) => setAlloc(rep, { hourlyRate: num(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Allocated Hours</label>
                  <input
                    type="number"
                    className={FIELD}
                    value={allocations[rep]?.allocatedHours ?? ""}
                    onChange={(e) => setAlloc(rep, { allocatedHours: num(e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {pageCount > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            Page {current + 1} of {pageCount}
            {auditors.length > 0 && ` · ${auditors.length} selected`}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditorSelect;
