#!/usr/bin/env node
/**
 * MCP server for the EHC resale inventory backend — the Supabase database
 * behind the "QuickFind Inventory" project (Lovable). Exposes inventory
 * browsing/management, marketplace cross-listing conflict detection, the
 * customer intake queue, and the published knowledge base as MCP tools.
 *
 * Read tools and customer-facing intake submission work with just the
 * project's publishable key (bundled defaults, overridable via
 * SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY). Staff tools (creating/updating
 * inventory, managing marketplace listings, reading/resolving the intake
 * queue) require SUPABASE_SERVICE_ROLE_KEY — see .env.example.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerInventoryTools } from "./tools/inventory.js";
import { registerMarketplaceTools } from "./tools/marketplace.js";
import { registerIntakeTools } from "./tools/intake.js";
import { registerKnowledgeTools } from "./tools/knowledge.js";
import { getAdminClient } from "./services/supabase-client.js";

const server = new McpServer({
  name: "ehc-inventory-mcp-server",
  version: "1.0.0",
});

registerInventoryTools(server);
registerMarketplaceTools(server);
registerIntakeTools(server);
registerKnowledgeTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio servers must not write to stdout — it's the protocol channel.
  console.error("ehc-inventory-mcp-server running via stdio");
  console.error(getAdminClient() ? "Staff (service-role) tools: enabled" : "Staff (service-role) tools: DISABLED — set SUPABASE_SERVICE_ROLE_KEY to enable");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
