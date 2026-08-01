const DEFAULT_ITEMS = [
  "EVERY PIECE ALREADY HAS A PAST",
  "NEW FINDS UNDER OLD LIGHT, WEEKLY",
  "MEN'S & WOMEN'S",
  "GRADED BY THE MOON, NOT A NUMBER",
  "ONE-OF-ONE — ONCE IT'S GONE, IT'S GONE",
];

export default function Marquee({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const track = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-line bg-gold text-void">
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
