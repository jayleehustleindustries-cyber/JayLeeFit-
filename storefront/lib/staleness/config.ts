/**
 * Stale inventory ladder configuration.
 *
 * The whole engine is driven by this file — tune the ladder here, not in the
 * logic. Every tier states an ABSOLUTE target as a fraction of the item's
 * original listed price, never a relative "drop another 10%". That is
 * deliberate: re-running the ladder is then idempotent. A duplicate cron fire,
 * a lost ledger, or a cold serverless filesystem can all replay the same tier
 * without compounding the discount.
 */

export type TierId = 'fresh' | 'tier_30' | 'tier_60' | 'tier_90' | 'tier_liquidate';

export type MarketplaceId = 'ebay' | 'poshmark' | 'mercari';

export interface TierRule {
  id: TierId;
  /** Inclusive lower bound, in days since the sheet Timestamp. */
  minDays: number;
  /** Exclusive upper bound. Infinity for the terminal tier. */
  maxDays: number;
  label: string;
  /**
   * Target price as a fraction of the ORIGINAL listed price. Absolute, not
   * cumulative — tier_60 means "land at 75% of original", regardless of
   * whether tier_30 ever ran.
   */
  priceMultiplier: number;
  /** Prepended to the listing title to buy search freshness + urgency. */
  titlePrefix: string | null;
  /** Banner appended to the description body. */
  descriptionBanner: string | null;
  /** Re-share (Poshmark) / re-list (eBay) to push the item back up in feeds. */
  bump: boolean;
  /** Terminal tiers stop auto-editing and ask a human to decide. */
  requiresHumanReview: boolean;
}

export const TIER_RULES: TierRule[] = [
  {
    id: 'fresh',
    minDays: 0,
    maxDays: 30,
    label: 'Fresh',
    priceMultiplier: 1.0,
    titlePrefix: null,
    descriptionBanner: null,
    bump: false,
    requiresHumanReview: false,
  },
  {
    id: 'tier_30',
    minDays: 30,
    maxDays: 60,
    label: '30-Day Nudge',
    priceMultiplier: 0.9,
    titlePrefix: null,
    descriptionBanner: 'Price just dropped — grab it before it moves.',
    bump: true,
    requiresHumanReview: false,
  },
  {
    id: 'tier_60',
    minDays: 60,
    maxDays: 90,
    label: '60-Day Drop',
    priceMultiplier: 0.75,
    titlePrefix: 'PRICE DROP',
    descriptionBanner: 'Reduced 25% off original listing price. Bundle to save more.',
    bump: true,
    requiresHumanReview: false,
  },
  {
    id: 'tier_90',
    minDays: 90,
    maxDays: 120,
    label: '90-Day Clearance',
    priceMultiplier: 0.6,
    titlePrefix: 'CLEARANCE',
    descriptionBanner: 'Final markdown — 40% off original. Offers welcome.',
    bump: true,
    requiresHumanReview: false,
  },
  {
    id: 'tier_liquidate',
    minDays: 120,
    maxDays: Infinity,
    label: 'Liquidate — Human Review',
    priceMultiplier: 0.6,
    titlePrefix: 'CLEARANCE',
    descriptionBanner: 'Final markdown — 40% off original. Offers welcome.',
    bump: false,
    // Past 120 days the ladder has done what it can. Auto-dropping further
    // just donates margin, so this tier stops and asks for a lot-sale /
    // donate / keep call instead.
    requiresHumanReview: true,
  },
];

export interface StalenessConfig {
  /** Hard dollar floor. No tier may take a listing below this. */
  absoluteFloor: number;
  /**
   * Soft floor as a fraction of the item's realistic sold value (the sheet's
   * "Realistic Sold Value" column). Protects margin on items whose original
   * listed price was aspirational.
   */
  floorPctOfRealistic: number;
  /** Prices are rounded to this granularity, then nudged to a .99 ending. */
  roundTo: number;
  /** Skip anything whose Inventory Status matches one of these. */
  inactiveStatuses: string[];
  /** Marketplaces the ladder is allowed to edit. */
  marketplaces: MarketplaceId[];
  /**
   * Cap on how many listings a single run may edit. Guards against a bad
   * Timestamp column flipping the whole catalogue to clearance at once.
   */
  maxEditsPerRun: number;
}

export const DEFAULT_CONFIG: StalenessConfig = {
  absoluteFloor: 8,
  floorPctOfRealistic: 0.5,
  roundTo: 1,
  inactiveStatuses: ['sold', 'pending', 'archived', 'donated', 'removed'],
  marketplaces: ['ebay', 'poshmark', 'mercari'],
  maxEditsPerRun: 40,
};

/** Title length ceilings enforced per marketplace. */
export const TITLE_LIMITS: Record<MarketplaceId, number> = {
  ebay: 80,
  poshmark: 50,
  mercari: 40,
};

export function resolveTier(daysInInventory: number): TierRule {
  const days = Number.isFinite(daysInInventory) ? Math.max(0, daysInInventory) : 0;
  return (
    TIER_RULES.find(rule => days >= rule.minDays && days < rule.maxDays) ??
    TIER_RULES[TIER_RULES.length - 1]
  );
}

export function loadConfig(): StalenessConfig {
  const num = (key: string, fallback: number) => {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    ...DEFAULT_CONFIG,
    absoluteFloor: num('STALE_ABSOLUTE_FLOOR', DEFAULT_CONFIG.absoluteFloor),
    floorPctOfRealistic: num('STALE_FLOOR_PCT', DEFAULT_CONFIG.floorPctOfRealistic),
    maxEditsPerRun: num('STALE_MAX_EDITS_PER_RUN', DEFAULT_CONFIG.maxEditsPerRun),
  };
}
