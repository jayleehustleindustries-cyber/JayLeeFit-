const TAG_STYLES: Record<string, string> = {
  "SHOOTING STAR": "text-gold",
  "FIXED STAR": "text-chalk",
  ECLIPSE: "text-umbra",
  RETROGRADE: "text-ash",
  SOLD: "text-ember",
};

export default function Badge({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag.toUpperCase()] ?? "text-chalk";
  return (
    <span
      className={`inline-block border border-current px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${style}`}
    >
      {tag}
    </span>
  );
}
