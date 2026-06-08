import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response } from "express";
import { tokenStore } from "./client.js";
import { createServer } from "./mcp.js";
import { buildProtectedResourceMetadata } from "./well-known.js";

const PORT = Number(process.env.PORT ?? 3399);
const TOKEN_PREFIX = "ck_";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.json(buildProtectedResourceMetadata());
});

/** Extracts the ck_ bearer token from the Authorization header, if present. */
function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.startsWith(TOKEN_PREFIX) ? token : token || null;
}

function jsonRpcError(res: Response, status: number, message: string): void {
  res.status(status).json({
    jsonrpc: "2.0",
    error: { code: -32000, message },
    id: null,
  });
}

// Stateless: a fresh server + transport per request, scoped to the caller's token.
app.post("/mcp", async (req: Request, res: Response) => {
  const token = bearerToken(req);
  if (!token) {
    res.setHeader(
      "WWW-Authenticate",
      'Bearer resource_metadata="https://mcp.cloudcenmax.com/.well-known/oauth-protected-resource"',
    );
    jsonRpcError(res, 401, "Missing API key. Send 'Authorization: Bearer ck_...'.");
    return;
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  await tokenStore.run(token, async () => {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });
});

// Stateless mode does not support server-initiated streams over GET/DELETE.
const methodNotAllowed = (_req: Request, res: Response) =>
  jsonRpcError(res, 405, "Method not allowed.");
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.listen(PORT, () => {
  console.log(`CloudCenmax MCP server listening on http://127.0.0.1:${PORT}/mcp`);
});
