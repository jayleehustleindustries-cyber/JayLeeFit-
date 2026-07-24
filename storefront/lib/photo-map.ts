import photoMap from "../data/photo-map.json";

/**
 * Repo-side SKU -> photo mapping, used only when the inventory sheet's own
 * image column is empty (the sheet stays the hub — see rowsToProducts).
 * Entries are Google Drive file ids by default; anything starting with
 * "http" passes through verbatim so re-hosted URLs can be dropped in.
 *
 * Files must be link-shared "Anyone with the link – Viewer". The lh3
 * endpoint serves Drive's JPEG preview rendition, so even HEIC originals
 * render in <img> tags; verify each id with
 * `curl -sI "https://lh3.googleusercontent.com/d/<id>=w1200"` (expect 200 +
 * image/jpeg) before committing it. Fallback endpoint if lh3 misbehaves:
 * https://drive.google.com/thumbnail?id=<id>&sz=w1200
 */
export function driveImageUrl(id: string, width = 1200): string {
  return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

export function imagesForSku(sku: string): string[] {
  const entries = (photoMap as Record<string, string[]>)[sku] ?? [];
  return entries.map((e) => (e.startsWith("http") ? e : driveImageUrl(e)));
}
