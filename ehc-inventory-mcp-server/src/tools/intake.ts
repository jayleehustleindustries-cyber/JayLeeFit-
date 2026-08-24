import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAdminClient, getPublicClient, MISSING_SERVICE_ROLE_KEY_MESSAGE, formatSupabaseError } from "../services/supabase-client.js";
import { buildResponse, paginate } from "../services/format.js";
import { limitField, offsetField, responseFormatField } from "../schemas/common.js";
import type { IntakeRequest } from "../types.js";

const INTAKE_TYPE_VALUES = [
  "inventory_search",
  "availability_check",
  "product_question",
  "offer_request",
  "sell_to_us",
  "sourcing_request",
  "local_pickup",
  "shipping",
  "wholesale_liquidation",
  "order_issue",
  "general_question",
] as const;

const INTAKE_STATUS_VALUES = ["open", "in_review", "waiting_customer", "resolved", "closed"] as const;
const PRIORITY_VALUES = ["low", "normal", "high", "urgent"] as const;

const SubmitIntakeSchema = z
  .object({
    intake_type: z.enum(INTAKE_TYPE_VALUES),
    message: z.string().min(1).max(4000).describe("What the visitor/customer is asking for or offering"),
    full_name: z.string().max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(40).optional(),
    location: z.string().max(200).optional(),
    budget_usd: z.number().nonnegative().optional(),
    urgency: z.string().max(100).optional(),
    source: z.string().default("mcp_agent").describe("Where this request originated, e.g. 'mcp_agent', 'phone_call', 'instagram_dm'"),
    response_format: responseFormatField,
  })
  .strict();
type SubmitIntakeInput = z.infer<typeof SubmitIntakeSchema>;

const ListIntakeSchema = z
  .object({
    status: z.enum(INTAKE_STATUS_VALUES).optional(),
    intake_type: z.enum(INTAKE_TYPE_VALUES).optional(),
    limit: limitField,
    offset: offsetField,
    response_format: responseFormatField,
  })
  .strict();
type ListIntakeInput = z.infer<typeof ListIntakeSchema>;

const UpdateIntakeSchema = z
  .object({
    intake_id: z.string().uuid(),
    status: z.enum(INTAKE_STATUS_VALUES).optional(),
    priority: z.enum(PRIORITY_VALUES).optional(),
    owner_notes: z.string().max(2000).optional(),
    resolution_outcome: z.string().max(2000).optional(),
    response_format: responseFormatField,
  })
  .strict()
  .refine((v) => v.status !== undefined || v.priority !== undefined || v.owner_notes !== undefined || v.resolution_outcome !== undefined, {
    message: "Provide at least one field to update",
  });
type UpdateIntakeInput = z.infer<typeof UpdateIntakeSchema>;

function intakeToMarkdown(r: IntakeRequest): string {
  return [
    `## ${r.intake_type} — ${r.status} (${r.id})`,
    `- **Priority**: ${r.priority}${r.budget_cents ? ` · **Budget**: $${(r.budget_cents / 100).toFixed(2)}` : ""}`,
    r.location ? `- **Location**: ${r.location}` : null,
    `- **Message**: ${r.message ?? "(none)"}`,
    r.ai_summary ? `- **Summary**: ${r.ai_summary}` : null,
    r.recommended_next_action ? `- **Recommended next action**: ${r.recommended_next_action}` : null,
    `- **Created**: ${r.created_at}`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

export function registerIntakeTools(server: McpServer): void {
  server.registerTool(
    "ehc_submit_intake_request",
    {
      title: "Submit EHC Intake Request",
      description: `Submit a customer request into the EHC review queue — selling an item to the shop, a sourcing request, a wholesale/liquidation inquiry, an availability question, an order issue, etc. Public-safe: works with just the anon key, no service role key required (mirrors what the site's own "Sell to us" form and AI receptionist do).

Args:
  - intake_type (required): one of inventory_search, availability_check, product_question, offer_request, sell_to_us, sourcing_request, local_pickup, shipping, wholesale_liquidation, order_issue, general_question
  - message (required): the actual request/offer/question
  - full_name, email, phone, location, budget_usd, urgency (all optional contact/context fields — a contact record is created only if at least one of full_name/email/phone is given)
  - source (default "mcp_agent")
  - response_format ('markdown' | 'json')

Returns: the created intake request's id, for reference.

Use when: a customer wants to sell something to the shop, is asking about sourcing/wholesale, or has a question that needs a human ("sell_to_us", "wholesale_liquidation", "order_issue", etc.)
Don't use when: you just want to browse current inventory — use ehc_list_inventory instead, this tool always creates a queue entry.`,
      inputSchema: SubmitIntakeSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: SubmitIntakeInput) => {
      try {
        const client = getPublicClient();
        let contactId: string | null = null;

        if (params.full_name || params.email || params.phone) {
          const { data: contact, error: contactError } = await client
            .from("contacts")
            .insert({
              full_name: params.full_name ?? null,
              email: params.email ?? null,
              phone: params.phone ?? null,
              preferred_contact: params.email ? "email" : "phone",
              location: params.location ?? null,
              source: params.source,
            })
            .select("id")
            .single();
          if (contactError) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Creating contact", contactError) }] };
          contactId = contact.id;
        }

        const { data, error } = await client
          .from("intake_requests")
          .insert({
            contact_id: contactId,
            intake_type: params.intake_type,
            budget_cents: params.budget_usd !== undefined ? Math.round(params.budget_usd * 100) : null,
            location: params.location ?? null,
            urgency: params.urgency ?? null,
            message: params.message,
            source: params.source,
          })
          .select("*")
          .single();

        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Submitting intake request", error) }] };

        return buildResponse(params.response_format, data, () => `Submitted ${params.intake_type} request (${data.id}) to the review queue.`);
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure submitting intake — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );

  server.registerTool(
    "ehc_list_intake_requests",
    {
      title: "List EHC Intake Requests",
      description: `List the staff review queue of customer requests (sell-to-us offers, sourcing requests, order issues, questions, etc.). STAFF ONLY — requires SUPABASE_SERVICE_ROLE_KEY, since intake_requests is not readable with the anon key.

Args:
  - status (optional): open, in_review, waiting_customer, resolved, closed
  - intake_type (optional filter)
  - limit (1-100, default 25), offset (default 0)
  - response_format ('markdown' | 'json')

Returns: paginated list of requests, newest first, with message, AI summary (if generated by the site's receptionist), and recommended next action.

Error Handling:
  - Returns a clear message telling you to set SUPABASE_SERVICE_ROLE_KEY if it's missing.`,
      inputSchema: ListIntakeSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: ListIntakeInput) => {
      const admin = getAdminClient();
      if (!admin) return { isError: true, content: [{ type: "text", text: MISSING_SERVICE_ROLE_KEY_MESSAGE }] };

      try {
        let q = admin.from("intake_requests").select("*", { count: "exact" }).order("created_at", { ascending: false });
        if (params.status) q = q.eq("status", params.status);
        if (params.intake_type) q = q.eq("intake_type", params.intake_type);
        q = q.range(params.offset, params.offset + params.limit - 1);

        const { data, error, count } = await q;
        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Listing intake requests", error) }] };

        const rows = (data ?? []) as IntakeRequest[];
        if (rows.length === 0) return { content: [{ type: "text", text: "No intake requests match those filters." }] };

        const result = paginate(rows, params.limit, params.offset, count ?? undefined);
        return buildResponse(params.response_format, result, (r) => [`# Intake requests (${r.total_returned} shown)`, "", ...r.items.map(intakeToMarkdown)].join("\n\n"));
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure listing intake requests — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );

  server.registerTool(
    "ehc_update_intake_request",
    {
      title: "Update EHC Intake Request",
      description: `Update the status, priority, or notes on a customer intake request — e.g. resolve it once handled. STAFF ONLY — requires SUPABASE_SERVICE_ROLE_KEY.

Args:
  - intake_id (required)
  - status, priority, owner_notes, resolution_outcome (all optional — at least one required)
  - response_format ('markdown' | 'json')

Returns: the updated row.

Error Handling:
  - Returns a clear message telling you to set SUPABASE_SERVICE_ROLE_KEY if it's missing.
  - Returns "Intake request not found" if intake_id doesn't match any row.`,
      inputSchema: UpdateIntakeSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: UpdateIntakeInput) => {
      const admin = getAdminClient();
      if (!admin) return { isError: true, content: [{ type: "text", text: MISSING_SERVICE_ROLE_KEY_MESSAGE }] };

      const patch: Record<string, unknown> = {};
      if (params.status !== undefined) patch.status = params.status;
      if (params.priority !== undefined) patch.priority = params.priority;
      if (params.owner_notes !== undefined) patch.owner_notes = params.owner_notes;
      if (params.resolution_outcome !== undefined) patch.resolution_outcome = params.resolution_outcome;

      try {
        const { data, error } = await admin.from("intake_requests").update(patch).eq("id", params.intake_id).select("*").maybeSingle();
        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Updating intake request", error) }] };
        if (!data) return { content: [{ type: "text", text: `Intake request not found: ${params.intake_id}` }] };

        return buildResponse(params.response_format, data, () => `Updated intake request ${params.intake_id}: ${Object.keys(patch).join(", ")}.`);
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure updating intake request — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );
}
