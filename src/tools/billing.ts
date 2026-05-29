import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, run } from "../helpers.js";

export function registerBillingTools(server: McpServer): void {
  server.registerTool(
    "list_ledger",
    {
      description:
        "List the organization's ledger entries (credits, accruals) newest first. Paginated 50 per page. Requires a read-capable API key.",
      inputSchema: {
        page: z.number().int().positive().optional().describe("Page number (50 per page)."),
      },
    },
    ({ page }) => run(() => callApi("GET", "/ledger", { query: { page } })),
  );

  server.registerTool(
    "list_deposits",
    {
      description:
        "List the organization's deposit transactions, newest first. Paginated 50 per page. Requires a read-capable API key.",
      inputSchema: {
        page: z.number().int().positive().optional().describe("Page number (50 per page)."),
      },
    },
    ({ page }) => run(() => callApi("GET", "/deposits", { query: { page } })),
  );

  server.registerTool(
    "create_deposit",
    {
      description:
        "WRITE: Start a deposit by creating a payment intent for the given amount (major currency units). Returns a reference, status, and client_secret to complete payment client-side. Requires a write-capable API key.",
      inputSchema: {
        amount: z.number().positive().describe("Deposit amount in major currency units (> 0)."),
      },
    },
    ({ amount }) => run(() => callApi("POST", "/deposits", { body: { amount } })),
  );
}
