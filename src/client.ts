import { AsyncLocalStorage } from "node:async_hooks";

/** Per-request store holding the caller's ck_ bearer token. */
export const tokenStore = new AsyncLocalStorage<string>();

const API_BASE = (process.env.CLOUDCENMAX_API_BASE ?? "https://cloudcenmax.com").replace(/\/+$/, "");

type Query = Record<string, string | number | undefined>;

interface CallOptions {
  query?: Query;
  body?: unknown;
}

/** Raised by callApi when the upstream API returns a non-2xx status. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_BASE}/api/v1${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Forwards a call to the CloudCenmax REST API using the caller's bearer token
 * from the current request context. Throws ApiError on non-2xx.
 */
export async function callApi(
  method: "GET" | "POST" | "DELETE",
  path: string,
  { query, body }: CallOptions = {},
): Promise<unknown> {
  const token = tokenStore.getStore();
  if (!token) {
    throw new ApiError(401, "Missing API key in request context.", null);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, describeError(response.status, payload), payload);
  }

  return payload;
}

function describeError(status: number, payload: unknown): string {
  const apiMessage =
    payload && typeof payload === "object" && "message" in payload
      ? String((payload as { message: unknown }).message)
      : undefined;

  switch (status) {
    case 401:
      return apiMessage ?? "Invalid or expired API key.";
    case 402: {
      const p = payload as Record<string, unknown> | null;
      if (p && "shortfall" in p) {
        return `Insufficient balance. Required ${p.required}, balance ${p.balance}, shortfall ${p.shortfall}.`;
      }
      return apiMessage ?? "Payment required.";
    }
    case 403:
      return apiMessage ?? "This API key lacks the required ability.";
    case 404:
      return apiMessage ?? "Not found.";
    case 422:
      return apiMessage ?? "Validation failed or invalid state transition.";
    default:
      return apiMessage ?? `Request failed with status ${status}.`;
  }
}
