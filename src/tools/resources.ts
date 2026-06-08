import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, run } from "../helpers.js";

export function registerResourceTools(server: McpServer): void {
  server.registerTool(
    "list_resources",
    {
      description:
        "List the organization's resources (servers), newest first. Paginated 25 per page. Requires a read-capable API key.",
      inputSchema: {
        page: z.number().int().positive().optional().describe("Page number (25 per page)."),
      },
    },
    ({ page }) => run(() => callApi("GET", "/resources", { query: { page } })),
  );

  server.registerTool(
    "get_resource",
    {
      description:
        "Get a single resource by id, including status, IP, SKU, and timestamps. Requires a read-capable API key.",
      inputSchema: {
        id: z.number().int().positive().describe("The resource id."),
      },
    },
    ({ id }) => run(() => callApi("GET", `/resources/${id}`)),
  );

  server.registerTool(
    "provision_resource",
    {
      description:
        "WRITE: Provision a new resource (server) from a catalog SKU. Requires a write-capable API key and sufficient balance (returns an insufficient-balance error otherwise). " +
        "Common provider-specific options (pass via the `options` object): " +
        "`template` — OS template id (use list_os_templates to discover ids, e.g. \"ubuntu-22.04\"); " +
        "`ssh_keys` — array of public SSH key strings to inject at first boot; " +
        "`enable_ipv6` — boolean, attach a public IPv6 address at provision time.",
      inputSchema: {
        name: z.string().min(1).max(255).describe("Display name for the resource."),
        sku: z.string().describe("An active SKU code (see list_catalog)."),
        options: z
          .record(z.unknown())
          .optional()
          .describe("Provider-specific provisioning options (object)."),
      },
    },
    ({ name, sku, options }) =>
      run(() => callApi("POST", "/resources", { body: { name, sku, options } })),
  );

  server.registerTool(
    "start_resource",
    {
      description: "WRITE: Power on a resource. Requires a write-capable API key.",
      inputSchema: { id: z.number().int().positive().describe("The resource id.") },
    },
    ({ id }) => run(() => callApi("POST", `/resources/${id}/start`)),
  );

  server.registerTool(
    "stop_resource",
    {
      description: "WRITE: Power off a resource. Requires a write-capable API key.",
      inputSchema: { id: z.number().int().positive().describe("The resource id.") },
    },
    ({ id }) => run(() => callApi("POST", `/resources/${id}/stop`)),
  );

  server.registerTool(
    "reboot_resource",
    {
      description: "WRITE: Reboot a resource. Requires a write-capable API key.",
      inputSchema: { id: z.number().int().positive().describe("The resource id.") },
    },
    ({ id }) => run(() => callApi("POST", `/resources/${id}/reboot`)),
  );

  server.registerTool(
    "terminate_resource",
    {
      description:
        "WRITE & DESTRUCTIVE: Permanently terminate a resource and destroy its data. This cannot be undone. Requires a write-capable API key.",
      inputSchema: { id: z.number().int().positive().describe("The resource id.") },
    },
    ({ id }) => run(() => callApi("DELETE", `/resources/${id}`)),
  );
}
