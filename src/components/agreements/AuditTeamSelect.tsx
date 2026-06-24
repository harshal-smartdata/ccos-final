import { Checkbox } from "@/components/ui/checkbox";
import {
  workManagementReps,
  type AuditAllocation,
} from "@/contexts/AgreementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

interface Props {
  team: string[];
  allocations: Record<string, AuditAllocation>;
  onChange: (team: string[], allocations: Record<string, AuditAllocation>) => void;
}

export const AuditTeamSelect = ({ team, allocations, onChange }: Props) => {
  const toggle = (rep: string) => {
    if (team.includes(rep)) {
      const next = { ...allocations };
      delete next[rep];
      onChange(team.filter((r) => r !== rep), next);
    } else {
      onChange([...team, rep], { ...allocations, [rep]: {} });
    }
  };

  const setAlloc = (rep: string, patch: Partial<AuditAllocation>) =>
    onChange(team, { ...allocations, [rep]: { ...allocations[rep], ...patch } });

  const num = (v: string) => (v === "" ? undefined : Number(v));

  return (
    <div className="space-y-2">
      {workManagementReps.map((rep) => {
        const selected = team.includes(rep);
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
    </div>
  );
};

export default AuditTeamSelect;
