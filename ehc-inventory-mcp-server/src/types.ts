// Hand-written types mirroring the QuickFind Inventory Supabase schema
// (supabase/migrations/*.sql in the Lovable project). Kept minimal and
// specific to what this server's tools actually read or write.

export type InventoryStatus = "available" | "pending" | "sold" | "needs_verification" | "draft";

export type IntakeType =
  | "inventory_search"
  | "availability_check"
  | "product_question"
  | "offer_request"
  | "sell_to_us"
  | "sourcing_request"
  | "local_pickup"
  | "shipping"
  | "wholesale_liquidation"
  | "order_issue"
  | "general_question";

export type IntakeStatus = "open" | "in_review" | "waiting_customer" | "resolved" | "closed";

export type PriorityLevel = "low" | "normal" | "high" | "urgent";

export interface PublicInventoryItem {
  id: string;
  sku: string | null;
  title: string;
  description: string | null;
  category: string;
  brand: string | null;
  size: string | null;
  item_condition: string;
  condition_notes: string | null;
  price_cents: number;
  currency: string;
  status: InventoryStatus;
  local_pickup: boolean;
  shipping_available: boolean;
  source: string;
  confidence: number;
  last_verified_at: string;
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem extends PublicInventoryItem {
  is_public: boolean;
  source_of_truth: string;
  storage_location: string | null;
  acquisition_cost_cents: number | null;
  owner_notes: string | null;
  needs_owner_review: boolean;
}

export interface InventoryImage {
  id: string;
  item_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  item_id: string;
  marketplace: string;
  listing_url: string | null;
  external_status: InventoryStatus | null;
  external_price_cents: number | null;
  last_synced_at: string | null;
  conflict: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntakeRequest {
  id: string;
  contact_id: string | null;
  conversation_id: string | null;
  intake_type: IntakeType;
  status: IntakeStatus;
  priority: PriorityLevel;
  urgency: string | null;
  budget_cents: number | null;
  location: string | null;
  message: string | null;
  ai_summary: string | null;
  recommended_next_action: string | null;
  confidence: number;
  source: string;
  owner_notes: string | null;
  resolution_outcome: string | null;
  needs_owner_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  is_published: boolean;
  sort_order: number;
}

export interface PaginatedResult<T> {
  total_returned: number;
  offset: number;
  limit: number;
  has_more: boolean;
  next_offset?: number;
  items: T[];
}
