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
        "The `template` parameter is REQUIRED — call list_os_templates first to get a valid id.",
      inputSchema: {
        name: z.string().min(1).max(255).describe("Display name for the resource."),
        sku: z.string().describe("An active SKU code (see list_catalog)."),
        template: z
          .string()
          .min(1)
          .describe(
            "OS template id (required). Use list_os_templates to discover valid ids, e.g. \"ubuntu-22.04\".",
          ),
        ssh_keys: z
          .array(z.string())
          .optional()
          .describe("Array of public SSH key strings to inject at first boot."),
        enable_ipv6: z
          .boolean()
          .optional()
          .describe("Attach a public IPv6 address at provision time."),
        options: z
          .record(z.unknown())
          .optional()
          .describe(
            "Escape hatch for any other provider-specific options. Prefer the named parameters above when available.",
          ),
      },
    },
    ({ name, sku, template, ssh_keys, enable_ipv6, options }) => {
      const mergedOptions: Record<string, unknown> = { ...(options ?? {}), template };
      if (ssh_keys !== undefined) mergedOptions.ssh_keys = ssh_keys;
      if (enable_ipv6 !== undefined) mergedOptions.enable_ipv6 = enable_ipv6;
      return run(() => callApi("POST", "/resources", { body: { name, sku, options: mergedOptions } }));
    },
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
