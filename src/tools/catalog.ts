import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, run } from "../helpers.js";

export function registerCatalogTools(server: McpServer): void {
  server.registerTool(
    "list_catalog",
    {
      description:
        "List active catalog SKUs (VM sizes) with customer-facing pricing. Paginated 50 per page. Optional filters by provider, location, and module. Requires a read-capable API key.",
      inputSchema: {
        provider: z.string().optional().describe("Filter by provider alias (e.g. \"O\")."),
        location: z.string().optional().describe("Filter by location code."),
        module: z.string().optional().describe("Filter by module (e.g. \"vm\")."),
        page: z.number().int().positive().optional().describe("Page number (50 per page)."),
      },
    },
    ({ provider, location, module, page }) =>
      run(() => callApi("GET", "/catalog", { query: { provider, location, module, page } })),
  );

  server.registerTool(
    "get_sku",
    {
      description:
        "Get a single active catalog SKU by its code, including specs and sell pricing. Requires a read-capable API key.",
      inputSchema: {
        code: z.string().describe("The SKU code, e.g. as returned by list_catalog."),
      },
    },
    ({ code }) => run(() => callApi("GET", `/catalog/${encodeURIComponent(code)}`)),
  );
}
