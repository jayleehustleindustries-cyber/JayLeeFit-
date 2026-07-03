export default function ConditionBadge({ condition }: { condition: string }) {
  const [score, ...rest] = condition.split("—").map((s) => s.trim());
  const label = rest.join(" — ");

  return (
    <span className="inline-flex items-center gap-1.5 border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mute">
      <span className="text-paper">{score}</span>
      {label && <span>{label}</span>}
    </span>
  );
}
