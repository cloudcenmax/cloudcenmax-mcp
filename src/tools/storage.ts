import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callApi, run } from "../helpers.js";

/**
 * Object-storage bucket tools. A storage account is a resource provisioned with
 * provision_resource using sku "storage.objstore"; buckets live under it. Region
 * keys come from list_catalog with module "storage" (ignore the "global" SKU).
 */
export function registerStorageTools(server: McpServer): void {
  server.registerTool(
    "list_buckets",
    {
      description:
        "List the buckets under an object-storage resource, with their region, access key id, and endpoint. Secrets are never returned here. Requires a read-capable API key.",
      inputSchema: {
        resource_id: z.number().int().positive().describe("The storage resource id."),
      },
    },
    ({ resource_id }) => run(() => callApi("GET", `/resources/${resource_id}/buckets`)),
  );

  server.registerTool(
    "create_bucket",
    {
      description:
        "WRITE: Create an object-storage bucket in a region and mint a bucket-scoped access key. The region is enabled on the account automatically on first use. The response includes secret_key ONCE — it cannot be retrieved again. First create the storage account with provision_resource (sku \"storage.objstore\"); get region keys from list_catalog (module \"storage\"). Requires a write-capable API key.",
      inputSchema: {
        resource_id: z.number().int().positive().describe("The storage resource id."),
        name: z.string().min(3).max(63).describe("Bucket name: 3–63 lowercase letters, digits, or hyphens."),
        region: z.string().describe("Region key from list_catalog (module storage), e.g. US-CA."),
      },
    },
    ({ resource_id, name, region }) =>
      run(() => callApi("POST", `/resources/${resource_id}/buckets`, { body: { name, region } })),
  );

  server.registerTool(
    "delete_bucket",
    {
      description:
        "WRITE & DESTRUCTIVE: Permanently delete a bucket and all of its objects, and revoke its access key. This cannot be undone. Requires a write-capable API key.",
      inputSchema: {
        resource_id: z.number().int().positive().describe("The storage resource id."),
        name: z.string().describe("The bucket name to delete."),
      },
    },
    ({ resource_id, name }) =>
      run(() => callApi("DELETE", `/resources/${resource_id}/buckets/${encodeURIComponent(name)}`)),
  );
}
