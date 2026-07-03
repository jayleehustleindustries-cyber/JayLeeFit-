/**
 * Renders inventory photos from arbitrary sheet-supplied URLs (Google Drive,
 * Imgur, a phone upload host, whatever the seller used) — a plain <img> is
 * used instead of next/image so we don't need to pre-register every
 * possible photo host in next.config. Falls back to a stylized placeholder
 * "no photo yet" tag until a real image URL is added to the sheet row.
 */
export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  }

  return (
    <div
      className={`halftone flex h-full w-full flex-col items-center justify-center gap-2 bg-concrete text-mute ${className}`}
    >
      <span className="font-display text-3xl tracking-wide text-line">RE:UP</span>
      <span className="font-mono text-[10px] uppercase tracking-widest">
        Photo coming soon
      </span>
    </div>
  );
}
