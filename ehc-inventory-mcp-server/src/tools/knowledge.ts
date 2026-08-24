import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPublicClient, formatSupabaseError } from "../services/supabase-client.js";
import { buildResponse } from "../services/format.js";
import { responseFormatField } from "../schemas/common.js";
import type { KnowledgeArticle } from "../types.js";

const ListKnowledgeSchema = z
  .object({
    category: z.string().optional().describe("Filter by category, e.g. 'faq', 'shipping', 'returns'"),
    response_format: responseFormatField,
  })
  .strict();
type ListKnowledgeInput = z.infer<typeof ListKnowledgeSchema>;

export function registerKnowledgeTools(server: McpServer): void {
  server.registerTool(
    "ehc_list_knowledge_articles",
    {
      title: "List EHC Knowledge Articles",
      description: `List published knowledge-base articles (FAQs, policies) that the site and its AI receptionist "Mira" are allowed to answer from. Public-safe — anon key only, no service role key required.

Args:
  - category (optional filter, e.g. 'faq', 'shipping', 'returns')
  - response_format ('markdown' | 'json')

Returns: published articles with title, category, and full body text, ordered by sort_order.

Use when: you need the shop's actual, approved policy language (shipping, returns, verification standard) rather than guessing at it.`,
      inputSchema: ListKnowledgeSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: ListKnowledgeInput) => {
      try {
        const client = getPublicClient();
        let q = client.from("knowledge_articles").select("*").eq("is_published", true).order("sort_order", { ascending: true });
        if (params.category) q = q.eq("category", params.category);

        const { data, error } = await q;
        if (error) return { isError: true, content: [{ type: "text", text: formatSupabaseError("Listing knowledge articles", error) }] };

        const articles = (data ?? []) as KnowledgeArticle[];
        if (articles.length === 0) return { content: [{ type: "text", text: "No published knowledge articles found." }] };

        return buildResponse(params.response_format, articles, (rows) =>
          rows.map((a) => `## ${a.title} (${a.category})\n${a.body}`).join("\n\n---\n\n"),
        );
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: `Error: Unexpected failure listing knowledge articles — ${err instanceof Error ? err.message : String(err)}` }] };
      }
    },
  );
}
