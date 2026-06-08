/**
 * RFC 9728 — OAuth 2.0 Protected Resource Metadata.
 *
 * Lets MCP clients discover the authorization server that issues tokens
 * for this resource (the Laravel app at cloudcenmax.com).
 */
export interface ProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  bearer_methods_supported: string[];
  scopes_supported: string[];
}

export function buildProtectedResourceMetadata(): ProtectedResourceMetadata {
  return {
    resource: "https://mcp.cloudcenmax.com/mcp",
    authorization_servers: ["https://cloudcenmax.com"],
    bearer_methods_supported: ["header"],
    scopes_supported: ["read", "write"],
  };
}
