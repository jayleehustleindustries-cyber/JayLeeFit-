import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAdminClient, getPublicClient, MISSING_SERVICE_ROLE_KEY_MESSAGE, formatSupabaseError } from "../services/supabase-client.js";
import { buildResponse, formatPrice, paginate } from "../services/format.js";
import { limitField, offsetField, responseFormatField } from "../schemas/common.js";
import type { MarketplaceListing } from "../types.js";

const STATUS_VALUES = ["available", "pending", "sold", "needs_verification", "draft"] as const;
const MARKETPLACE_VALUES = ["ebay", "poshmark", "mercari", "depop", "facebook_marketplace", "vendoo"] as const;

const UpsertListingSchema = z
  .object({
    item_id: z.string().uuid().describe("The internal inventory item this listing tracks"),
    marketplace: z.enum(MARKETPLACE_VALUES),
    listing_url: z.string().url().optional(),
    external_status: z.enum(STATUS_VALUES).optional().describe("What that marketplace currently shows for this item"),
    external_price_usd: z.number().nonnegative().optional(),
    response_format: responseFormatField,
  })
  .strict();
type UpsertListingInput = z.infer<typeof UpsertListingSchema>;

const ListConflictsSchema = z
  .object({
    limit: limitField,
    offset: offsetField,
    response_format: responseFormatField,
  })
  .strict();
type ListConflictsInput = z.infer<typeof ListConflictsSchema>;

function listingToMarkdown(l: MarketplaceListing): string {
  return `- **${l.marketplace}** on item ${l.item_id}: ${l.external_status ?? "unknown"}${
    l.external_price_cents ? ` (${formatPrice(l.external_price_cents)})` : ""
  }${l.conflict ? " ⚠️ CONFLICT" : ""}${l.listing_url ? ` — ${l.listing_url}` : ""} (synced ${l.last_synced_at ?? "never"})`;
}

export function registerMarketplaceTools(server: McpServer): void {
  server.registerTool(
    "ehc_upsert_marketplace_listing",
    {
      title: "Record EHC Marketplace Listing Status",
      description: `Record or update the status of an item's listing on an external marketplace (eBay, Poshmark, Mercari, Depop, Facebook Marketplace, Vendoo). STAFF ONLY — requires SUPABASE_SERVICE_ROLE_KEY.

This is the key tool for keeping cross-listed inventory honest: the database has an existing trigger that automatically flags a "conflict" whenever a marketplace reports an item as sold while the internal record still says available/pending/needs_verification — exactly the double-sell risk of selling the same one-off item on multiple channels. Call this every time you check or update a listing's status elsewhere, then check ehc_list_marketplace_conflicts periodically.

Args:
  - item_id (required), marketplace (required, one of: ebay, poshmark, mercari, depop, facebook_marketplace, vendoo)
  - listing_url, external_status, external_price_usd (all optional — pass what you currently know)
  - response_format ('markdown' | 'json')

Behavior: creates a new listing record if none exists yet for this item+marketplace, otherwise updates the existing one and refreshes last_synced_at. The conflict flag is computed by the database, not by this tool.

Error Handling:
  - Returns a clear message telling you to set SUPABASE_SERVICE_ROLE_KEY if it's missing.
  - Returns "Item not found" if item_id doesn't match any inventory row (foreign key violation).`,
      inputSchema: UpsertListingSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: UpsertListingInput) => {
      const admin = getAdminClient();
      if (!admin) return { isError: true, content: [{ type: "text", text: MISSING_SERVICE_ROLE_KEY_MESSAGE }] };

      try {
        const { data: existing, error: findError } = await admin
          .from("marketplace_listings")
          .select("id")
          .eq("item_id", params.item_id)
          .eq("marketplace", params.marketplace)
          .maybeSingle();
        if (findError) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Looking up existing listing", findError) }] };

        const payload = {
          item_id: params.item_id,
          marketplace: params.marketplace,
          listing_url: params.listing_url ?? null,
          external_status: params.external_status ?? null,
          external_price_cents: params.external_price_usd !== undefined ? Math.round(params.external_price_usd * 100) : null,
          last_synced_at: new Date().toISOString(),
        };

        const { data, error } = existing
          ? await admin.from("marketplace_listings").update(payload).eq("id", existing.id).select("*").single()
          : await admin.from("marketplace_listings").insert(payload).select("*").single();

        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Recording marketplace listing", error) }] };

        const listing = data as MarketplaceListing;
        const conflictNote = listing.conflict ? " ⚠️ This now conflicts with the internal inventory status — check ehc_get_inventory_item." : "";
        return buildResponse(params.response_format, listing, () => listingToMarkdown(listing) + conflictNote);
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure recording listing — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );

  server.registerTool(
    "ehc_list_marketplace_conflicts",
    {
      title: "List EHC Marketplace Conflicts",
      description: `List marketplace listings currently flagged as conflicting with the internal inventory record — i.e. a marketplace (eBay, Poshmark, etc.) reports an item sold while the internal system still shows it as available, pending, or needs verification. This is the double-sell early-warning report: resolve these before someone buys an item that's already gone elsewhere.

Uses the service-role client when SUPABASE_SERVICE_ROLE_KEY is configured (sees conflicts on every item, including unpublished drafts); otherwise falls back to the public client, which can only see conflicts on publicly-listed items — the response tells you which mode was used.

Args:
  - limit (1-100, default 25), offset (default 0)
  - response_format ('markdown' | 'json')

Returns: paginated list of conflicting listings with marketplace, external status, and the internal item_id to look up with ehc_get_inventory_item.

Error Handling:
  - Returns "No conflicts found" (not an error) when the list is empty — that's the good outcome.`,
      inputSchema: ListConflictsSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: ListConflictsInput) => {
      const admin = getAdminClient();
      const client = admin ?? getPublicClient();
      const scopeNote = admin ? "full visibility (service role)" : "public items only (no service role key configured)";

      try {
        const { data, error, count } = await client
          .from("marketplace_listings")
          .select("*", { count: "exact" })
          .eq("conflict", true)
          .order("updated_at", { ascending: false })
          .range(params.offset, params.offset + params.limit - 1);

        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Listing marketplace conflicts", error) }] };

        const listings = (data ?? []) as MarketplaceListing[];
        if (listings.length === 0) {
          return { content: [{ type: "text", text: `No conflicts found (scope: ${scopeNote}).` }] };
        }

        const result = paginate(listings, params.limit, params.offset, count ?? undefined);
        return buildResponse(params.response_format, { ...result, scope: scopeNote }, (r) =>
          [`# Marketplace conflicts (${r.total_returned} shown, scope: ${scopeNote})`, "", ...r.items.map(listingToMarkdown)].join("\n"),
        );
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure listing conflicts — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );
}
