import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAdminClient, getPublicClient, MISSING_SERVICE_ROLE_KEY_MESSAGE, formatSupabaseError } from "../services/supabase-client.js";
import { buildResponse, formatPrice, paginate } from "../services/format.js";
import { limitField, offsetField, responseFormatField, ResponseFormat } from "../schemas/common.js";
import type { InventoryImage, InventoryStatus, MarketplaceListing, PublicInventoryItem } from "../types.js";

const STATUS_VALUES = ["available", "pending", "sold", "needs_verification", "draft"] as const;

const ListInventorySchema = z
  .object({
    query: z.string().max(200).optional().describe("Free-text search against item title and brand"),
    category: z.string().optional().describe("Filter by category, e.g. 'clothing', 'footwear', 'electronics'"),
    brand: z.string().optional().describe("Filter by exact brand name"),
    condition: z.string().optional().describe("Filter by item_condition, e.g. 'good', 'like new'"),
    status: z.enum(STATUS_VALUES).optional().describe("Filter by inventory status"),
    fulfillment: z.enum(["local", "shipping"]).optional().describe("Filter to items available for local pickup or shipping"),
    max_price_usd: z.number().positive().optional().describe("Only items at or below this price in US dollars"),
    limit: limitField,
    offset: offsetField,
    response_format: responseFormatField,
  })
  .strict();
type ListInventoryInput = z.infer<typeof ListInventorySchema>;

const GetInventoryItemSchema = z
  .object({
    item_id: z.string().uuid().describe("Inventory item UUID"),
    response_format: responseFormatField,
  })
  .strict();
type GetInventoryItemInput = z.infer<typeof GetInventoryItemSchema>;

const CreateInventoryItemSchema = z
  .object({
    title: z.string().min(1).max(200).describe("Item title, e.g. 'Levi's 501 Straight Jeans'"),
    price_usd: z.number().nonnegative().describe("List price in US dollars, e.g. 24.99"),
    sku: z.string().max(64).optional().describe("Unique SKU; leave unset to have the shop assign one manually later"),
    description: z.string().max(4000).optional(),
    category: z.string().default("other").describe("e.g. 'clothing', 'footwear', 'electronics', 'local_pickup', 'other'"),
    brand: z.string().optional(),
    size: z.string().optional(),
    item_condition: z.string().default("good").describe("Free-text condition grade, e.g. 'like new', 'good', 'fair'"),
    condition_notes: z.string().max(2000).optional(),
    currency: z.string().length(3).default("USD"),
    is_public: z.boolean().default(false).describe("Whether this item is visible on the public site immediately"),
    local_pickup: z.boolean().default(true),
    shipping_available: z.boolean().default(true),
    source: z.string().default("internal").describe("Where this item came from, e.g. 'internal', 'ebay_import', 'poshmark_import'"),
    storage_location: z.string().max(200).optional(),
    acquisition_cost_usd: z.number().nonnegative().optional().describe("What the shop paid for this item, in US dollars"),
    owner_notes: z.string().max(2000).optional(),
    primary_image_url: z.string().url().optional(),
    response_format: responseFormatField,
  })
  .strict();
type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;

const UpdateInventoryItemSchema = z
  .object({
    item_id: z.string().uuid(),
    status: z.enum(STATUS_VALUES).optional().describe("Changing this is logged automatically to inventory_status_history"),
    price_usd: z.number().nonnegative().optional(),
    is_public: z.boolean().optional(),
    condition_notes: z.string().max(2000).optional(),
    storage_location: z.string().max(200).optional(),
    owner_notes: z.string().max(2000).optional(),
    needs_owner_review: z.boolean().optional(),
    primary_image_url: z.string().url().optional(),
    mark_verified_now: z.boolean().default(false).describe("Set last_verified_at to the current time (use after a human physically confirms the item)"),
    response_format: responseFormatField,
  })
  .strict()
  .refine(
    (v) =>
      v.status !== undefined ||
      v.price_usd !== undefined ||
      v.is_public !== undefined ||
      v.condition_notes !== undefined ||
      v.storage_location !== undefined ||
      v.owner_notes !== undefined ||
      v.needs_owner_review !== undefined ||
      v.primary_image_url !== undefined ||
      v.mark_verified_now,
    { message: "Provide at least one field to update" },
  );
type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>;

const AddInventoryImageSchema = z
  .object({
    item_id: z.string().uuid(),
    url: z.string().url().describe("Publicly reachable image URL"),
    alt_text: z.string().max(300).optional(),
    sort_order: z.number().int().min(0).default(0),
    response_format: responseFormatField,
  })
  .strict();
type AddInventoryImageInput = z.infer<typeof AddInventoryImageSchema>;

function inventoryItemToMarkdown(item: PublicInventoryItem): string {
  const lines = [
    `## ${item.title} (${item.id})`,
    `- **Price**: ${formatPrice(item.price_cents, item.currency)}`,
    `- **Status**: ${item.status}`,
    `- **Category**: ${item.category}${item.brand ? ` · **Brand**: ${item.brand}` : ""}${item.size ? ` · **Size**: ${item.size}` : ""}`,
    `- **Condition**: ${item.item_condition}${item.condition_notes ? ` — ${item.condition_notes}` : ""}`,
    `- **Fulfillment**: ${[item.local_pickup && "local pickup", item.shipping_available && "ships"].filter(Boolean).join(", ") || "unspecified"}`,
    `- **Last verified**: ${item.last_verified_at} (confidence ${item.confidence})`,
    item.sku ? `- **SKU**: ${item.sku}` : null,
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}

export function registerInventoryTools(server: McpServer): void {
  server.registerTool(
    "ehc_list_inventory",
    {
      title: "List EHC Inventory",
      description: `List publicly-listed resale inventory items from the EHC/QuickFind Inventory Supabase backend, with optional filters.

This reads the public_inventory view (published, non-draft items only) via the anon key — always available, no service role key required.

Args:
  - query (string, optional): free-text search against title and brand
  - category, brand, condition, status, fulfillment, max_price_usd (all optional filters)
  - limit (1-100, default 25), offset (default 0)
  - response_format ('markdown' | 'json')

Returns: paginated list of items with id, title, price, status, category, brand, size, condition, fulfillment, last_verified_at.

Examples:
  - "What jackets do we have under $50?" -> category="clothing", query="jacket", max_price_usd=50
  - "Show everything that ships" -> fulfillment="shipping"

Error Handling:
  - Returns "No inventory items match" if the filtered result set is empty (the database may simply have no public inventory yet).`,
      inputSchema: ListInventorySchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: ListInventoryInput) => {
      try {
        const client = getPublicClient();
        let q = client.from("public_inventory").select("*", { count: "exact" }).order("updated_at", { ascending: false });

        if (params.query) q = q.or(`title.ilike.%${params.query}%,brand.ilike.%${params.query}%`);
        if (params.category) q = q.eq("category", params.category);
        if (params.brand) q = q.eq("brand", params.brand);
        if (params.condition) q = q.eq("item_condition", params.condition);
        if (params.status) q = q.eq("status", params.status);
        if (params.fulfillment === "local") q = q.eq("local_pickup", true);
        if (params.fulfillment === "shipping") q = q.eq("shipping_available", true);
        if (params.max_price_usd !== undefined) q = q.lte("price_cents", Math.round(params.max_price_usd * 100));

        q = q.range(params.offset, params.offset + params.limit - 1);

        const { data, error, count } = await q;
        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Listing inventory", error) }] };

        const items = (data ?? []) as PublicInventoryItem[];
        if (items.length === 0) {
          return { content: [{ type: "text", text: "No inventory items match those filters." }] };
        }

        const result = paginate(items, params.limit, params.offset, count ?? undefined);
        return buildResponse(params.response_format, result, (r) =>
          [`# Inventory (${r.total_returned} shown, offset ${r.offset})`, "", ...r.items.map(inventoryItemToMarkdown)].join("\n\n"),
        );
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure listing inventory — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );

  server.registerTool(
    "ehc_get_inventory_item",
    {
      title: "Get EHC Inventory Item",
      description: `Fetch a single publicly-listed inventory item by ID, including its images and any marketplace listings (eBay, Poshmark, etc.) tracked for it.

Args:
  - item_id (string, UUID, required)
  - response_format ('markdown' | 'json')

Returns: the item plus an images array and a listings array (each listing shows marketplace, external_status, and whether it conflicts with the internal status — see ehc_list_marketplace_conflicts for why that matters).

Error Handling:
  - Returns "Item not found" if the ID doesn't exist or the item isn't public (draft items are intentionally invisible here — use ehc_update_inventory_item's staff path if you need to inspect a draft).`,
      inputSchema: GetInventoryItemSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: GetInventoryItemInput) => {
      try {
        const client = getPublicClient();
        const [itemRes, imagesRes, listingsRes] = await Promise.all([
          client.from("public_inventory").select("*").eq("id", params.item_id).maybeSingle(),
          client.from("inventory_images").select("*").eq("item_id", params.item_id).order("sort_order", { ascending: true }),
          client.from("marketplace_listings").select("*").eq("item_id", params.item_id),
        ]);

        if (itemRes.error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Fetching item", itemRes.error) }] };
        if (!itemRes.data) return { content: [{ type: "text", text: `Item not found: ${params.item_id} (not public, or doesn't exist).` }] };

        const item = itemRes.data as PublicInventoryItem;
        const images = (imagesRes.data ?? []) as InventoryImage[];
        const listings = (listingsRes.data ?? []) as MarketplaceListing[];
        const structured = { item, images, listings };

        return buildResponse(params.response_format, structured, (r) =>
          [
            inventoryItemToMarkdown(r.item),
            "",
            `### Images (${r.images.length})`,
            ...r.images.map((img) => `- ${img.url}${img.alt_text ? ` — ${img.alt_text}` : ""}`),
            "",
            `### Marketplace listings (${r.listings.length})`,
            ...r.listings.map(
              (l) => `- ${l.marketplace}: ${l.external_status ?? "unknown"}${l.conflict ? " ⚠️ CONFLICTS with internal status" : ""}${l.listing_url ? ` — ${l.listing_url}` : ""}`,
            ),
          ].join("\n"),
        );
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure fetching item — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );

  server.registerTool(
    "ehc_create_inventory_item",
    {
      title: "Create EHC Inventory Item",
      description: `Add a new inventory item to the EHC/QuickFind Inventory database. STAFF ONLY — requires SUPABASE_SERVICE_ROLE_KEY to be configured on this server, since RLS restricts inventory writes to staff accounts.

Args:
  - title (required), price_usd (required)
  - sku, description, category, brand, size, item_condition, condition_notes, currency, primary_image_url (all optional)
  - is_public (default false — item stays hidden from the public site until you're ready; flip on with ehc_update_inventory_item)
  - local_pickup, shipping_available (default true)
  - source (default "internal" — set to e.g. "ebay_import" when backfilling from an existing eBay/Poshmark listing)
  - storage_location, acquisition_cost_usd, owner_notes (internal-only fields, never shown publicly)
  - response_format ('markdown' | 'json')

Returns: the newly created item's id and the fields you set.

Error Handling:
  - Returns a clear message telling you to set SUPABASE_SERVICE_ROLE_KEY if it's missing.
  - Returns "SKU already exists" style errors verbatim from the database on unique-constraint violations.`,
      inputSchema: CreateInventoryItemSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: CreateInventoryItemInput) => {
      const admin = getAdminClient();
      if (!admin) return { isError: true, content: [{ type: "text", text: MISSING_SERVICE_ROLE_KEY_MESSAGE }] };

      try {
        const { data, error } = await admin
          .from("inventory_items")
          .insert({
            title: params.title,
            price_cents: Math.round(params.price_usd * 100),
            sku: params.sku ?? null,
            description: params.description ?? null,
            category: params.category,
            brand: params.brand ?? null,
            size: params.size ?? null,
            item_condition: params.item_condition,
            condition_notes: params.condition_notes ?? null,
            currency: params.currency,
            is_public: params.is_public,
            local_pickup: params.local_pickup,
            shipping_available: params.shipping_available,
            source: params.source,
            storage_location: params.storage_location ?? null,
            acquisition_cost_cents: params.acquisition_cost_usd !== undefined ? Math.round(params.acquisition_cost_usd * 100) : null,
            owner_notes: params.owner_notes ?? null,
            primary_image_url: params.primary_image_url ?? null,
          })
          .select("*")
          .single();

        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Creating inventory item", error) }] };

        return buildResponse(params.response_format, data, () => `Created inventory item "${params.title}" (${data.id}), ${formatPrice(data.price_cents, data.currency)}, public: ${data.is_public}.`);
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure creating item — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );

  server.registerTool(
    "ehc_update_inventory_item",
    {
      title: "Update EHC Inventory Item",
      description: `Update an existing inventory item — status, price, visibility, or notes. STAFF ONLY — requires SUPABASE_SERVICE_ROLE_KEY.

Args:
  - item_id (required)
  - status (optional): changing this is automatically logged to inventory_status_history by an existing database trigger — no extra bookkeeping needed
  - price_usd, is_public, condition_notes, storage_location, owner_notes, needs_owner_review, primary_image_url (all optional)
  - mark_verified_now (boolean, default false): set last_verified_at to now, e.g. after physically confirming the item is still on the shelf
  - response_format ('markdown' | 'json')
  - At least one updatable field must be provided

Returns: the updated row.

Error Handling:
  - Returns a clear message telling you to set SUPABASE_SERVICE_ROLE_KEY if it's missing.
  - Returns "Item not found" if item_id doesn't match any row.`,
      inputSchema: UpdateInventoryItemSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: UpdateInventoryItemInput) => {
      const admin = getAdminClient();
      if (!admin) return { isError: true, content: [{ type: "text", text: MISSING_SERVICE_ROLE_KEY_MESSAGE }] };

      const patch: Record<string, unknown> = {};
      if (params.status !== undefined) patch.status = params.status;
      if (params.price_usd !== undefined) patch.price_cents = Math.round(params.price_usd * 100);
      if (params.is_public !== undefined) patch.is_public = params.is_public;
      if (params.condition_notes !== undefined) patch.condition_notes = params.condition_notes;
      if (params.storage_location !== undefined) patch.storage_location = params.storage_location;
      if (params.owner_notes !== undefined) patch.owner_notes = params.owner_notes;
      if (params.needs_owner_review !== undefined) patch.needs_owner_review = params.needs_owner_review;
      if (params.primary_image_url !== undefined) patch.primary_image_url = params.primary_image_url;
      if (params.mark_verified_now) patch.last_verified_at = new Date().toISOString();

      try {
        const { data, error } = await admin.from("inventory_items").update(patch).eq("id", params.item_id).select("*").maybeSingle();
        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Updating inventory item", error) }] };
        if (!data) return { content: [{ type: "text", text: `Item not found: ${params.item_id}` }] };

        return buildResponse(params.response_format, data, () => `Updated item ${params.item_id}: ${Object.keys(patch).join(", ")}.`);
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure updating item — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );

  server.registerTool(
    "ehc_add_inventory_image",
    {
      title: "Add EHC Inventory Image",
      description: `Attach an image URL to an inventory item. STAFF ONLY — requires SUPABASE_SERVICE_ROLE_KEY.

Args:
  - item_id (required), url (required, must be a publicly reachable image URL)
  - alt_text (optional), sort_order (default 0, lower shows first)
  - response_format ('markdown' | 'json')

Returns: the created image row.

Note: this only attaches an already-hosted image URL — it does not upload files. Host the image first (e.g. Supabase Storage, Google Drive with a public link) and pass that URL here.`,
      inputSchema: AddInventoryImageSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: AddInventoryImageInput) => {
      const admin = getAdminClient();
      if (!admin) return { isError: true, content: [{ type: "text", text: MISSING_SERVICE_ROLE_KEY_MESSAGE }] };

      try {
        const { data, error } = await admin
          .from("inventory_images")
          .insert({ item_id: params.item_id, url: params.url, alt_text: params.alt_text ?? null, sort_order: params.sort_order })
          .select("*")
          .single();

        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Adding inventory image", error) }] };

        return buildResponse(params.response_format, data, () => `Added image to item ${params.item_id}: ${params.url}`);
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure adding image — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );
}
