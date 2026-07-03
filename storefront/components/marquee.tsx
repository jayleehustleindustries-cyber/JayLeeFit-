const DEFAULT_ITEMS = [
  "AUTHENTICATED PRE-OWNED",
  "NEW DROPS EVERY FRIDAY",
  "UP TO 70% OFF RETAIL",
  "MEN'S & WOMEN'S",
  "ONE-OFF PIECES — ONCE IT'S GONE, IT'S GONE",
];

export default function Marquee({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const track = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-line bg-acid text-ink">
      <div className="marquee-track flex w-max whitespace-nowrap py-2">
        {track.map((item, i) => (
          <span
            key={i}
            className="mx-4 font-mono text-xs font-bold tracking-widest uppercase"
          >
            {item} <span className="mx-4">{"//"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
