import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, run } from "../helpers.js";

export function registerActionTools(server: McpServer): void {
  server.registerTool(
    "list_resource_actions",
    {
      description:
        "Enumerate the provider-specific capability actions available for a resource (e.g. VNC, rescue, reinstall, hostname, snapshot, root password, IPv6), including each action's key and input field descriptors. Requires a read-capable API key.",
      inputSchema: {
        id: z.number().int().positive().describe("The resource id."),
      },
    },
    ({ id }) => run(() => callApi("GET", `/resources/${id}/actions`)),
  );

  server.registerTool(
    "execute_resource_action",
    {
      description:
        "WRITE: Execute a provider capability action on a resource. Use list_resource_actions first to discover valid keys and required params. Params are validated upstream against the action's field descriptors. Requires a write-capable API key.",
      inputSchema: {
        id: z.number().int().positive().describe("The resource id."),
        key: z.string().describe("The capability action key (from list_resource_actions)."),
        params: z
          .record(z.string())
          .optional()
          .describe("Action parameters keyed by field name."),
      },
    },
    ({ id, key, params }) =>
      run(() =>
        callApi("POST", `/resources/${id}/actions/${encodeURIComponent(key)}`, {
          body: params ?? {},
        }),
      ),
  );
}
