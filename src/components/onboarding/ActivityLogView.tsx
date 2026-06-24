import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ActivityLogEntry } from "@/contexts/OnboardingContext";

interface Props {
  entries: ActivityLogEntry[];
  pageSize?: number;
}

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

/** A4.13 — Client Activity Log timeline (newest first) with pagination. */
export const ActivityLogView = ({ entries, pageSize = 5 }: Props) => {
  const [page, setPage] = useState(0);

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>;
  }

  const ordered = [...entries].reverse(); // newest first
  const pageCount = Math.max(1, Math.ceil(ordered.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const start = current * pageSize;
  const visible = ordered.slice(start, start + pageSize);

  return (
    <div className="space-y-3">
      <ol className="space-y-3">
        {visible.map((e) => (
          <li key={e.id} className="flex gap-3 text-sm">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
            <div>
              <div>{e.message}</div>
              <div className="text-xs text-muted-foreground">{fmt(e.at)}</div>
            </div>
          </li>
        ))}
      </ol>

      {ordered.length > pageSize && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <span>{ordered.length} entries</span>
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
        </div>
      )}
    </div>
  );
};

export default ActivityLogView;
