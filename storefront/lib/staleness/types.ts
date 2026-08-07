import type { MarketplaceId, TierId } from './config';

/** Why a decision came out the way it did — surfaced on the dashboard. */
export type SkipReason =
  | 'inactive_status'
  | 'no_listed_price'
  | 'already_at_target'
  | 'tier_unchanged'
  | 'human_review_required'
  | 'run_cap_reached';

export interface PriceDecision {
  /** Original listed price straight off the sheet. The ladder's anchor. */
  originalPrice: number;
  /** What the tier asks for, before the floor is applied. */
  rawTarget: number;
  /** The floor that applied, and where it came from. */
  floor: number;
  floorSource: 'absolute' | 'realistic_value';
  /** Final price to push. Never below `floor`. */
  targetPrice: number;
  /** True when the floor overrode the tier's ask. */
  floored: boolean;
}

export interface ListingEdit {
  sku: string;
  brand: string;
  garment: string;
  tier: TierId;
  tierLabel: string;
  daysInInventory: number;
  price: PriceDecision;
  /** Per-marketplace titles, each truncated to that marketplace's limit. */
  titles: Partial<Record<MarketplaceId, string>>;
  descriptionBanner: string | null;
  bump: boolean;
  /** Marketplaces this edit should reach, based on the links present. */
  targets: MarketplaceId[];
  ebayItemId?: string;
  poshmarkUrl?: string;
}

export interface SkippedItem {
  sku: string;
  reason: SkipReason;
  tier: TierId;
  daysInInventory: number;
  detail?: string;
}

export interface StalenessPlan {
  generatedAt: string;
  edits: ListingEdit[];
  skipped: SkippedItem[];
  /** Items past the ladder that need a human call. */
  humanReview: ListingEdit[];
  counts: {
    scanned: number;
    edits: number;
    skipped: number;
    humanReview: number;
    byTier: Record<TierId, number>;
  };
}

export type ExecutionChannel = 'csv' | 'ebay-api' | 'queue';

export interface EditResult {
  sku: string;
  marketplace: MarketplaceId;
  channel: ExecutionChannel;
  status: 'applied' | 'queued' | 'skipped' | 'error';
  detail: string;
}

export interface StalenessRunReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  dryRun: boolean;
  plan: StalenessPlan;
  results: EditResult[];
  counts: {
    applied: number;
    queued: number;
    errored: number;
  };
}

/** One row of the ledger: what the ladder has already done to a SKU. */
export interface LedgerEntry {
  sku: string;
  lastTier: TierId;
  lastPrice: number;
  lastAppliedAt: string;
  /** Every tier this SKU has passed through, oldest first. */
  history: Array<{ tier: TierId; price: number; at: string }>;
}
