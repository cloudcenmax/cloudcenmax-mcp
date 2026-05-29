import { ApiError, callApi } from "./client.js";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function text(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

/**
 * Runs an API-backed tool handler, returning the JSON payload as text and
 * mapping ApiError into a model-readable error result instead of throwing.
 */
export async function run(fn: () => Promise<unknown>): Promise<ToolResult> {
  try {
    const data = await fn();
    return { content: [{ type: "text", text: text(data) }] };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error.";
    return { content: [{ type: "text", text: message }], isError: true };
  }
}

export { callApi };
