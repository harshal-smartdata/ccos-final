import { useState } from "react";
import { Check, X, FolderUp, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useOnboardings,
  dcStepOrder,
  dcStepLabels,
  type Onboarding,
  type DcStep,
} from "@/contexts/OnboardingContext";

/**
 * A4.8 — Client Onboarding, Data Collection Process (L3). A nested branching wizard
 * that runs inside the DataCollection stage. Decision steps record an answer and
 * advance via advanceDcStep; process steps confirm-and-advance. Reaching "Done" lets
 * the parent stage continue to Under Review.
 */
export default function DataCollectionFlow({ onboarding }: { onboarding: Onboarding }) {
  const { updateOnboarding, logActivity, advanceDcStep, setDcStep } = useOnboardings();

  const step: DcStep = onboarding.dcStep ?? "Review";
  const stepIdx = dcStepOrder.indexOf(step);
  const id = onboarding.id;

  const patch = (p: Partial<Onboarding>) => {
    const { id: _id, ...rest } = { ...onboarding, ...p };
    updateOnboarding(id, rest);
  };

  const answer = (key: string, value: boolean) => advanceDcStep(id, { key, value });
  const proceed = () => advanceDcStep(id);

  // ── reusable controls ──────────────────────────────────────────
  const YesNo = ({ k }: { k: string }) => (
    <div className="flex gap-2 mt-4">
      <Button onClick={() => answer(k, true)}>
        <Check className="h-4 w-4 mr-1" /> Yes
      </Button>
      <Button variant="outline" onClick={() => answer(k, false)}>
        <X className="h-4 w-4 mr-1" /> No
      </Button>
    </div>
  );

  const Decision = ({ title, k, hint }: { title: string; k: string; hint?: string }) => (
    <div>
      <p className="text-sm">{title}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      <YesNo k={k} />
    </div>
  );

  const Process = ({
    title,
    hint,
    cta,
  }: {
    title: string;
    hint?: string;
    cta: string;
  }) => (
    <div>
      <p className="text-sm">{title}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      <Button className="mt-4" onClick={proceed}>
        {cta} <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );

  // ── DCC Library upload (A4.8.9) ────────────────────────────────
  const library = onboarding.dcLibrary ?? [];
  const addDocs = (names: string[]) => {
    if (names.length === 0) return;
    patch({ dcLibrary: [...library, ...names] });
    logActivity(id, `Added ${names.length} document(s) to DCC Library: ${names.join(", ")}.`);
  };
  const removeDoc = (i: number) => patch({ dcLibrary: library.filter((_, j) => j !== i) });

  const renderBody = () => {
    switch (step) {
      case "Review":
        return (
          <Process
            title="Review the data sources available from the Client in order to receive the required historical data."
            cta="Begin data collection"
          />
        );

      case "Integration":
        return (
          <Decision
            title="Is integration with the Client's systems required?"
            hint="Choosing Yes triggers Execute & Test System Integration."
            k="integrationRequired"
          />
        );

      case "CustomTemplate":
        return (
          <Decision
            title="Does the Client require a customized data template?"
            hint="Choosing Yes triggers Develop & Test customized data template(s)."
            k="customTemplate"
          />
        );

      case "HistoricalSources":
        return <HistoricalSources onboarding={onboarding} />;

      case "CbsaRequest":
        return (
          <Process
            title="Request Historical CAD & FIRM Reports from CBSA."
            hint="Create the request to CBSA, then mark it submitted to await their response."
            cta="Request submitted to CBSA"
          />
        );

      case "CbsaReview":
        return (
          <Decision
            title="Is the CBSA data received acceptable?"
            hint="Choosing No loops back to create another request to CBSA."
            k="cbsaAcceptable"
          />
        );

      case "DccLibrary":
        return (
          <div>
            <p className="text-sm">Add the collected Data &amp; Documentation to the DCC Library.</p>
            <div className="mt-3">
              <input
                type="file"
                multiple
                className="text-sm"
                onChange={(e) => {
                  const added = Array.from(e.target.files ?? []).map((f) => f.name);
                  addDocs(added);
                  e.target.value = "";
                }}
              />
              {library.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {library.map((name, i) => (
                    <li key={i} className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <span className="truncate">{name}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeDoc(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button className="mt-4" onClick={proceed} disabled={library.length === 0}>
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        );

      case "Recurring":
        return (
          <Decision
            title="Are there reoccurring new data collection requirements?"
            hint="Yes triggers development & client validation; No checks for standalone licensing requirements."
            k="recurring"
          />
        );

      case "StandaloneLicensing":
        // A4.8.14 — exit question; the answer records the downstream route (dcOutcome).
        return (
          <div>
            <p className="text-sm">
              Are there additional data collection requirements for a stand-alone software licensing service?
            </p>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  patch({ dcOutcome: "ToB4" });
                  logActivity(id, "Additional stand-alone licensing requirements identified — routes to 1:B4 L2.");
                  answer("standaloneLicensing", true);
                }}
              >
                <Check className="h-4 w-4 mr-1" /> Yes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  patch({ dcOutcome: "ToA4_2" });
                  logActivity(id, "No stand-alone licensing requirements — routes to 1:A4.2 L2.");
                  answer("standaloneLicensing", false);
                }}
              >
                <X className="h-4 w-4 mr-1" /> No
              </Button>
            </div>
          </div>
        );

      case "DevValidation": {
        const track = onboarding.dcAnswers?.integrationRequired
          ? "System Integration Development & Testing"
          : "Manual Process Development & Testing";
        return (
          <div>
            <p className="text-sm">{track}</p>
            <p className="text-sm mt-2">Is the new data confirmed and validated by the Client?</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => answer("dataValidated", true)}>
                <Check className="h-4 w-4 mr-1" /> Yes — validated
              </Button>
              <Button variant="outline" onClick={() => answer("dataValidated", false)}>
                <X className="h-4 w-4 mr-1" /> Not yet
              </Button>
            </div>
          </div>
        );
      }

      case "Done":
        return (
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Data collection process complete. Continue to Under Review using the button below.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-stepper (approximate linear projection of the branching flow). Completed
          steps are clickable to go back and review/edit an earlier answer. */}
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {dcStepOrder.map((s, i) => {
          const done = step === "Done" ? true : i < stepIdx;
          const active = i === stepIdx;
          return (
            <div key={s} className="flex items-center gap-1">
              <button
                type="button"
                disabled={!done}
                onClick={() => done && setDcStep(onboarding.id, s)}
                title={done ? "Go back to review / edit this step" : undefined}
                className={cn(
                  "rounded-full px-2 py-0.5 border whitespace-nowrap",
                  active && "bg-primary text-primary-foreground border-primary font-medium",
                  done && "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 cursor-pointer",
                  !active && !done && "text-muted-foreground border-border cursor-default",
                )}
              >
                {dcStepLabels[s]}
              </button>
              {i < dcStepOrder.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          );
        })}
      </div>
      {stepIdx > 0 && (
        <button
          type="button"
          onClick={() => setDcStep(onboarding.id, dcStepOrder[stepIdx - 1])}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to previous step
        </button>
      )}

      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-3">
          <FolderUp className="h-3.5 w-3.5" /> {dcStepLabels[step]}
        </div>
        {renderBody()}
      </div>
    </div>
  );
}

// A4.8.6/7/8 — the three historical-data sources are all optional. Tick any that
// apply; any source selected routes to the DCC Library, none selected routes to a
// request to CBSA.
const HISTORICAL_SOURCES: { key: string; label: string }[] = [
  { key: "clientHistorical", label: "The Client has additional historical data / documentation to provide" },
  {
    key: "partnerHistorical",
    label: "The Client's Trade Chain Partner(s) have provided historical data or documentation",
  },
  {
    key: "dominionPortal",
    label: "Dominion has requested & received historical data from the Client's Trade Chain Partner(s) portal",
  },
];

function HistoricalSources({ onboarding }: { onboarding: Onboarding }) {
  const { updateOnboarding, advanceDcStep } = useOnboardings();
  const answers = onboarding.dcAnswers ?? {};
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(HISTORICAL_SOURCES.map((s) => [s.key, answers[s.key] === true])),
  );

  const toggle = (key: string, value: boolean) => setSelected((s) => ({ ...s, [key]: value }));

  const confirm = () => {
    const { id, ...rest } = {
      ...onboarding,
      dcAnswers: { ...answers, ...selected, historicalSourcesConfirmed: true },
    };
    updateOnboarding(onboarding.id, rest);
    advanceDcStep(onboarding.id); // recomputes next step from the merged answers
  };

  return (
    <div>
      <p className="text-sm">Which historical data sources are providing data or documentation?</p>
      <p className="text-xs text-muted-foreground mt-1">
        All optional — select all that apply. If none are available, the historical reports will be requested from CBSA.
      </p>
      <div className="mt-4 space-y-3">
        {HISTORICAL_SOURCES.map((s) => (
          <label key={s.key} className="flex items-start gap-2 text-sm">
            <Checkbox checked={selected[s.key]} onCheckedChange={(v) => toggle(s.key, Boolean(v))} />
            <span>{s.label}</span>
          </label>
        ))}
      </div>
      <Button className="mt-4" onClick={confirm}>
        Continue <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
