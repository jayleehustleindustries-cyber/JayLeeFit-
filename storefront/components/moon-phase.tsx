type Phase = "full" | "gibbous" | "half" | "crescent";

const PHASES: { max: number; phase: Phase; label: string }[] = [
  { max: 4, phase: "crescent", label: "Old Light" },
  { max: 6, phase: "half", label: "Half-Light" },
  { max: 8, phase: "gibbous", label: "Waxing" },
  { max: Infinity, phase: "full", label: "Full Illumination" },
];

function phaseFor(score: number) {
  return PHASES.find((p) => score <= p.max) ?? PHASES[PHASES.length - 1];
}

/**
 * Condition grading, reframed as moon phases — how much of a piece's first
 * life is still visible on it. Derived from the 1–10 conditionScore that
 * already comes off the inventory sheet, so sellers keep grading items the
 * normal way ("9/10 — Like New") and this is just how it reads on the site.
 */
export default function MoonPhase({
  score,
  condition,
}: {
  score: number;
  condition?: string;
}) {
  const { phase, label } = phaseFor(score);

  return (
    <span className="inline-flex items-center gap-1.5" title={condition}>
      <span className={`moon phase-${phase}`} aria-hidden="true" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-ash">
        {label}
      </span>
    </span>
  );
}
