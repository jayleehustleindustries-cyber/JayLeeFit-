/**
 * Cross-market hook between this storefront and the JayLeeFit coaching
 * brand. Controlled entirely by env vars so it can be switched off, or
 * repointed at a different sibling brand, without touching code:
 *
 *   NEXT_PUBLIC_SHOW_CROSS_PROMO=false   hides this component
 *   NEXT_PUBLIC_JAYLEEFIT_URL=...        link target
 *   NEXT_PUBLIC_JAYLEEFIT_LABEL=...      display name
 */
export default function CrossPromoBanner() {
  const show = process.env.NEXT_PUBLIC_SHOW_CROSS_PROMO !== "false";
  if (!show) return null;

  const url = process.env.NEXT_PUBLIC_JAYLEEFIT_URL || "#";
  const label = process.env.NEXT_PUBLIC_JAYLEEFIT_LABEL || "JayLeeFit Coaching";

  return (
    <a
      href={url}
      className="group flex items-center justify-center gap-2 border-t border-line bg-concrete px-4 py-3 text-center font-mono text-[11px] tracking-widest text-mute uppercase transition-colors hover:text-acid"
    >
      Also part of the JayLeeFit family
      <span className="text-paper transition-colors group-hover:text-acid">
        — {label} →
      </span>
    </a>
  );
}
