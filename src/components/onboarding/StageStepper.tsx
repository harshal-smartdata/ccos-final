import { cn } from "@/lib/utils";
import { stageOrder, stageLabels, type Stage } from "@/contexts/OnboardingContext";

interface Props {
  current: Stage;
}

/** Horizontal stepper visualizing the 1:A4 onboarding stages. */
export const StageStepper = ({ current }: Props) => {
  const currentIdx = stageOrder.indexOf(current);
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {stageOrder.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={stage} className="flex items-center gap-1">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 border whitespace-nowrap",
                active && "bg-primary text-primary-foreground border-primary font-medium",
                done && "bg-primary/10 text-primary border-primary/30",
                !active && !done && "text-muted-foreground border-border",
              )}
            >
              {stageLabels[stage]}
            </span>
            {i < stageOrder.length - 1 && <span className="text-muted-foreground">→</span>}
          </div>
        );
      })}
    </div>
  );
};

export default StageStepper;
