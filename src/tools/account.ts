import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callApi, run } from "../helpers.js";

export function registerAccountTools(server: McpServer): void {
  server.registerTool(
    "get_account",
    {
      description:
        "Get the current organization, its balance (micros + major amount), and dunning status. Requires a read-capable API key.",
      inputSchema: {},
    },
    () => run(() => callApi("GET", "/account")),
  );
}
