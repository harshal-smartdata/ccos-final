import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { operationalEmployees } from "@/contexts/OnboardingContext";

interface Props {
  assigned: string[];
  onChange: (assigned: string[]) => void;
  pageSize?: number;
}

/** A4.12 — Dominion assigns operational employee(s); table view with pagination. */
export const TeamAssignEditor = ({ assigned, onChange, pageSize = 5 }: Props) => {
  const [page, setPage] = useState(0);
  const toggle = (name: string, on: boolean) =>
    onChange(on ? [...assigned, name] : assigned.filter((n) => n !== name));

  const pageCount = Math.max(1, Math.ceil(operationalEmployees.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const start = current * pageSize;
  const visible = operationalEmployees.slice(start, start + pageSize);

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2 w-16">Assign</th>
              <th className="text-left font-medium px-3 py-2">Employee</th>
              <th className="text-left font-medium px-3 py-2 w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((name) => {
              const isAssigned = assigned.includes(name);
              return (
                <tr key={name} className="border-t">
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={isAssigned}
                      onCheckedChange={(v) => toggle(name, Boolean(v))}
                    />
                  </td>
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        isAssigned
                          ? "text-xs rounded-full bg-primary/10 text-primary border border-primary/30 px-2 py-0.5"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {isAssigned ? "Assigned" : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{assigned.length} assigned</span>
        {operationalEmployees.length > pageSize && (
          <div className="flex items-center gap-2">
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

export default TeamAssignEditor;
