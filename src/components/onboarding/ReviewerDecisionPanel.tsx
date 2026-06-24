import { Check, FilePen, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ReviewDecision } from "@/contexts/OnboardingContext";

interface Props {
  decision: ReviewDecision;
  onDecide: (decision: Exclude<ReviewDecision, null>) => void;
}

/** A4.6 — Dominion Reviewer gate: Accept / Accept with Edits / Request Information. */
export const ReviewerDecisionPanel = ({ decision, onDecide }: Props) => {
  const buttons: {
    value: Exclude<ReviewDecision, null>;
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: "Accept", label: "Accept", icon: Check },
    { value: "AcceptWithEdits", label: "Accept with Edits", icon: FilePen },
    { value: "RequestInfo", label: "Request Information", icon: MessageSquareWarning },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Is the client information acceptable?
      </p>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => {
          const Icon = b.icon;
          const selected = decision === b.value;
          return (
            <Button
              key={b.value}
              variant={selected ? "default" : "outline"}
              onClick={() => onDecide(b.value)}
              className={cn(selected && "ring-2 ring-primary/30")}
            >
              <Icon className="h-4 w-4 mr-1" />
              {b.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewerDecisionPanel;
