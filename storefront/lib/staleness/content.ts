import type { InventoryItem } from '../data/sheets-fetcher';
import { TITLE_LIMITS, type MarketplaceId, type TierRule } from './config';

/**
 * Title and description rewriting for stale listings.
 *
 * Two jobs: signal the markdown to buyers, and change the listing text at all —
 * marketplace search tends to reward recently-edited listings, so a title that
 * moves is worth as much as the price that moves.
 */

/** Composes the neutral, tier-free title from the sheet columns. */
export function baseTitle(item: InventoryItem): string {
  const parts = [item.brand, item.garment].map(p => (p || '').trim()).filter(Boolean);
  const core = parts.join(' ') || item.sku;
  const gender = (item.gender || '').trim();
  return gender ? `${gender} ${core}` : core;
}

/**
 * Truncates on a word boundary so titles never end mid-word. Falls back to a
 * hard cut when a single token is longer than the limit.
 */
function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(' ');
  return (lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd();
}

/**
 * Builds the tier-marked title for one marketplace. The prefix is always kept —
 * it is the part carrying the markdown signal — and the descriptive tail is
 * what gets trimmed to fit.
 */
export function titleForMarketplace(
  item: InventoryItem,
  tier: TierRule,
  marketplace: MarketplaceId
): string {
  const limit = TITLE_LIMITS[marketplace];
  const base = baseTitle(item);

  if (!tier.titlePrefix) return truncate(base, limit);

  const prefix = `${tier.titlePrefix} — `;
  // Prefix alone overflowing the limit means the marketplace can't carry the
  // marker; drop it rather than ship a title that is only a banner.
  if (prefix.length >= limit) return truncate(base, limit);

  return `${prefix}${truncate(base, limit - prefix.length)}`;
}

export function titlesForTargets(
  item: InventoryItem,
  tier: TierRule,
  targets: MarketplaceId[]
): Partial<Record<MarketplaceId, string>> {
  return Object.fromEntries(
    targets.map(m => [m, titleForMarketplace(item, tier, m)])
  ) as Partial<Record<MarketplaceId, string>>;
}

/**
 * The markdown banner plus the original condition notes. The banner leads so it
 * survives any marketplace that truncates description previews.
 */
export function descriptionFor(item: InventoryItem, tier: TierRule): string | null {
  if (!tier.descriptionBanner) return null;
  const notes = (item.notes || '').trim();
  const condition = (item.condition || '').trim();

  return [
    tier.descriptionBanner,
    condition ? `Condition: ${condition}` : null,
    notes || null,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Pulls the numeric eBay item ID out of a listing URL. eBay item URLs put the
 * ID as the last path segment (`/itm/123456789012`), sometimes preceded by a
 * slug (`/itm/some-title/123456789012`), and item IDs run 9-12 digits.
 */
export function extractEbayItemId(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/\/itm\/(?:[^/?#]*\/)?(\d{9,14})/) || url.match(/[?&]item=(\d{9,14})/);
  return match?.[1];
}
