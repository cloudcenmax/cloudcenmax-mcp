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

  server.registerTool(
    "list_os_templates",
    {
      description:
        "List OS templates available for provisioning (e.g. Ubuntu 22.04, Debian 12). Pass the returned id as options.template to provision_resource. Requires a read-capable API key.",
      inputSchema: {
        provider: z
          .string()
          .optional()
          .describe("Provider alias (defaults to \"O\" — OneProvider, the only one today)."),
      },
    },
    ({ provider }) =>
      run(() => callApi("GET", "/catalog/os-templates", { query: { provider } })),
  );

  server.registerTool(
    "list_continents",
    {
      description:
        "List continents we serve, with country/city/plan counts and the cheapest live price in each. Use this to start a top-down geographic search before drilling into countries and cities. Requires a read-capable API key.",
      inputSchema: {},
    },
    () => run(() => callApi("GET", "/catalog/continents")),
  );

  server.registerTool(
    "list_countries",
    {
      description:
        "List countries we serve, optionally filtered to a single continent. Each row carries city/plan counts and the cheapest live price. Requires a read-capable API key.",
      inputSchema: {
        continent: z
          .string()
          .optional()
          .describe("Continent slug (e.g. \"europe\", \"asia\") — as returned by list_continents."),
      },
    },
    ({ continent }) =>
      run(() => callApi("GET", "/catalog/countries", { query: { continent } })),
  );

  server.registerTool(
    "list_cities",
    {
      description:
        "List cities we serve in a country (or across a continent). Each city includes plan count, cheapest price, and the raw provider location codes — feed those into list_catalog?location=… to see the actual SKUs. Requires a read-capable API key.",
      inputSchema: {
        country: z
          .string()
          .optional()
          .describe("Country slug (e.g. \"germany\") — as returned by list_countries."),
        continent: z
          .string()
          .optional()
          .describe("Continent slug — used only when no country is given."),
      },
    },
    ({ country, continent }) =>
      run(() => callApi("GET", "/catalog/cities", { query: { country, continent } })),
  );
}
