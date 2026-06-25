import { cn } from "@/lib/utils";
import { stageOrder, stageLabels, type Stage } from "@/contexts/OnboardingContext";

interface Props {
  current: Stage;
  /** Override which stages are shown (e.g. to hide the conditional CARM stage). */
  stages?: Stage[];
  /** When provided, completed stages become clickable to go back and edit them. */
  onSelect?: (stage: Stage) => void;
}

/** Horizontal stepper visualizing the 1:A4 onboarding stages. */
export const StageStepper = ({ current, stages = stageOrder, onSelect }: Props) => {
  const currentIdx = stages.indexOf(current);
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {stages.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const clickable = done && !!onSelect;
        return (
          <div key={stage} className="flex items-center gap-1">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelect(stage)}
              title={clickable ? "Go back to edit this stage" : undefined}
              className={cn(
                "rounded-full px-2.5 py-1 border whitespace-nowrap",
                active && "bg-primary text-primary-foreground border-primary font-medium",
                done && "bg-primary/10 text-primary border-primary/30",
                clickable && "hover:bg-primary/20 cursor-pointer",
                !active && !done && "text-muted-foreground border-border cursor-default",
              )}
            >
              {stageLabels[stage]}
            </button>
            {i < stages.length - 1 && <span className="text-muted-foreground">→</span>}
          </div>
        );
      })}
    </div>
  );
};

export default StageStepper;
