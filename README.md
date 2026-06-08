# CloudCenmax MCP Server

A remote [Model Context Protocol](https://modelcontextprotocol.io) server that
exposes the [CloudCenmax](https://cloudcenmax.com) `/api/v1` REST API as MCP
tools, so AI assistants can manage cloud resources, billing, and the catalog in
plain language.

> Hosted endpoint: `https://mcp.cloudcenmax.com/mcp` — grab an API key from
> [cloudcenmax.com/api-keys](https://cloudcenmax.com/api-keys) and you're done.

It is a **stateless proxy**: each MCP request carries the caller's API key in the
`Authorization` header, which is forwarded verbatim to the platform API. No token
storage, no database. The key's abilities (`read` / `write`) gate what works.

## Run it locally

Requires **Node 22+**.

```bash
npm install
cp .env.example .env   # set CLOUDCENMAX_API_BASE and PORT
npm run dev            # or: npm run build && npm start
```

Env vars:
- `CLOUDCENMAX_API_BASE` — platform base URL, no trailing slash (default `https://cloudcenmax.com`). The server appends `/api/v1`.
- `PORT` — listen port (default `3399`).

The MCP endpoint is `POST http://<host>:<PORT>/mcp`. A `GET /health` returns `{"status":"ok"}`.

## Authentication

Send the user's CloudCenmax API key as a bearer token on every request:

```
Authorization: Bearer ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Issue a key from the [API keys page](https://cloudcenmax.com/api-keys) in your
CloudCenmax dashboard. Each key has a scope: pick `read` to let the assistant
browse safely, or `read + write` to let it provision and control resources. The
token is shown once — copy it then.

## Tools

| Tool | Ability | Description |
|---|---|---|
| `get_account` | read | Organization, balance, dunning status |
| `list_catalog` | read | Active SKUs (filters: provider, location, module; page) |
| `get_sku` | read | Single SKU by code |
| `list_resources` | read | Resources, newest first (page) |
| `get_resource` | read | Single resource by id |
| `list_resource_actions` | read | Provider capability actions for a resource |
| `list_buckets` | read | Object-storage buckets under a storage resource |
| `list_ledger` | read | Ledger entries (page) |
| `list_deposits` | read | Deposit transactions (page) |
| `provision_resource` | write | Create a resource from a SKU (use `storage.objstore` for object storage) |
| `start_resource` / `stop_resource` / `reboot_resource` | write | Power controls |
| `terminate_resource` | write | **Destructive** — permanently destroy a resource |
| `execute_resource_action` | write | Run a capability action (VNC, rescue, reinstall, …) |
| `create_bucket` | write | Create an object-storage bucket in a region (returns the secret once) |
| `delete_bucket` | write | **Destructive** — delete a bucket and all its objects |
| `create_deposit` | write | Start a deposit payment intent |

## Local testing with the MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Connect to `http://127.0.0.1:3399/mcp` (Streamable HTTP) with the header
`Authorization: Bearer ck_...`. A read-only key returns a clear ability error on
any write tool.

## Deployment

Pushes to `main` deploy automatically to the production VPS via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — it SSHes into
the host, fast-forwards the working tree, reinstalls deps, rebuilds, and
reloads PM2 using [`ecosystem.config.cjs`](ecosystem.config.cjs).

## License

MIT — see [LICENSE](LICENSE).
