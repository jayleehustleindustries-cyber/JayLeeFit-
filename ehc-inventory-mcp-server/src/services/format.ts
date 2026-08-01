import { CHARACTER_LIMIT } from "../constants.js";
import { ResponseFormat } from "../schemas/common.js";
import type { PaginatedResult } from "../types.js";

export function formatPrice(cents: number | null | undefined, currency = "USD"): string {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function paginate<T>(rows: T[], limit: number, offset: number, totalCount?: number): PaginatedResult<T> {
  const total = totalCount ?? offset + rows.length;
  const hasMore = total > offset + rows.length;
  return {
    total_returned: rows.length,
    offset,
    limit,
    has_more: hasMore,
    ...(hasMore ? { next_offset: offset + rows.length } : {}),
    items: rows,
  };
}

/**
 * Build a dual text/structured tool response, truncating the text
 * representation if it exceeds CHARACTER_LIMIT rather than overwhelming the
 * context window.
 */
export function buildResponse<T>(
  format: ResponseFormat,
  structured: T,
  toMarkdown: (data: T) => string,
): { content: [{ type: "text"; text: string }]; structuredContent: Record<string, unknown> } {
  let text = format === ResponseFormat.JSON ? JSON.stringify(structured, null, 2) : toMarkdown(structured);

  if (text.length > CHARACTER_LIMIT) {
    text =
      text.slice(0, CHARACTER_LIMIT) +
      `\n\n[Truncated — response exceeded ${CHARACTER_LIMIT} characters. Narrow your filters or reduce the limit.]`;
  }

  // The MCP SDK types structuredContent as an index-signature object; our
  // domain types (including arrays) are still valid JSON, so cast through
  // unknown rather than polluting every domain interface with `[key: string]: unknown`.
  return {
    content: [{ type: "text", text }],
    structuredContent: structured as unknown as Record<string, unknown>,
  };
}
