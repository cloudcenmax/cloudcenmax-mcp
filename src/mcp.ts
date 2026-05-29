import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAccountTools } from "./tools/account.js";
import { registerActionTools } from "./tools/actions.js";
import { registerBillingTools } from "./tools/billing.js";
import { registerCatalogTools } from "./tools/catalog.js";
import { registerResourceTools } from "./tools/resources.js";
import { registerStorageTools } from "./tools/storage.js";

/** Builds a fresh McpServer with all CloudCenmax tools registered. */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "cloudcenmax",
    version: "0.1.0",
  });

  registerAccountTools(server);
  registerCatalogTools(server);
  registerResourceTools(server);
  registerStorageTools(server);
  registerActionTools(server);
  registerBillingTools(server);

  return server;
}
