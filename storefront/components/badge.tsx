const TAG_STYLES: Record<string, string> = {
  STEAL: "bg-acid text-ink",
  RARE: "bg-paper text-ink",
  "LAST ONE": "bg-warning text-paper",
  "NEW IN": "bg-paper text-ink",
  SOLD: "bg-warning text-paper",
};

export default function Badge({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag.toUpperCase()] ?? "bg-paper text-ink";
  return (
    <span
      className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${style}`}
    >
      {tag}
    </span>
  );
}
