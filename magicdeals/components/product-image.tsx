"use client";

import { useState } from "react";

/**
 * Product photo with a graceful "card back" fallback — Drive-hosted photos
 * only render once the underlying file is shared publicly, and plenty of
 * real inventory has no photos yet. The fallback is styled like the back
 * of a playing card so a missing photo still looks intentional.
 */
export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-velvet-deep ${className}`}
        role="img"
        aria-label={`${alt} — photo coming soon`}
      >
        <div className="flex h-24 w-16 items-center justify-center rounded-md border border-gold/50 bg-velvet shadow-[0_0_20px_rgba(217,180,91,0.15)]">
          <span className="font-display text-2xl text-gold">✦</span>
        </div>
        <span className="px-3 text-center font-mono text-[10px] uppercase tracking-widest text-fog">
          The reveal is coming
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote Drive
    // thumbnails with unknown dimensions; next/image needs sizing metadata.
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
