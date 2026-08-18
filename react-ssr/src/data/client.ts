/**
 * The typed oRPC client for the upstream REST API, in two forms:
 *
 *  - `apiClient` — a plain promise client: `await apiClient.items.list()`. Use it
 *    from mutations, server functions, or anywhere outside a query.
 *  - `api` — TanStack Query utils built from it: `api.items.list.queryOptions()`,
 *    which drop straight into route loaders and `useSuspenseQuery` (this is what
 *    `#/data/queries` re-exports).
 *
 * The module is isomorphic — the same code runs during SSR (inside the Worker)
 * and in the browser — with the two environment-specific concerns handled below:
 * which base URL to hit, and how the auth cookie reaches the API.
 */
import { createORPCClient, onError } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { contract } from "#/lib/contract";

// `JsonifiedClient` reflects that responses have made a round-trip through JSON
// over HTTP — e.g. a contract `z.date()` comes back as a string, not a `Date`.
// Swapping `contract` for your published package's contract re-types the whole
// client automatically.
type ApiClient = JsonifiedClient<ContractRouterClient<typeof contract>>;

/**
 * Where the REST API lives. The browser must use a publicly reachable origin
 * (`VITE_API_URL`, inlined into the client bundle at build time). The server can
 * point at an internal origin instead (`API_URL`, e.g. a service-to-service URL
 * that never leaves your network) and otherwise falls back to the public one.
 */
function apiBaseUrl(): string {
  const serverOverride = import.meta.env.SSR ? process.env.API_URL : undefined;
  return serverOverride || import.meta.env.VITE_API_URL || "http://localhost:8787";
}

/**
 * Auth is a cookie shared with the API. In the browser that cookie rides along
 * automatically (see `credentials: "include"` below). During SSR there is no
 * ambient cookie jar, so forward the `Cookie` header off the incoming request —
 * without this, every server-side fetch would look signed-out and the page would
 * render empty before the client re-fetched it.
 */
async function forwardedHeaders(): Promise<Record<string, string>> {
  if (!import.meta.env.SSR) return {};
  // Server-only. The dynamic import is dead-code-eliminated from the client
  // bundle because `import.meta.env.SSR` is statically `false` there.
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const cookie = getRequestHeader("cookie");
  return cookie ? { cookie } : {};
}

const link = new OpenAPILink(contract, {
  url: apiBaseUrl(),
  headers: forwardedHeaders,
  // `credentials: "include"` sends the auth cookie on cross-origin browser
  // requests — the API must answer with `Access-Control-Allow-Credentials: true`
  // and a specific (non-`*`) `Access-Control-Allow-Origin`. Harmless under SSR.
  fetch: (request, init) => globalThis.fetch(request, { ...init, credentials: "include" }),
  interceptors: [
    onError((error) => {
      console.error("[orpc] request failed", error);
    }),
  ],
});

export const apiClient: ApiClient = createORPCClient(link);

/**
 * TanStack Query utils. `api.items.list.queryOptions()` returns a ready-made
 * `queryOptions` object — a stable query key plus a typed fetcher — so a loader
 * can `ensureQueryData(...)` it on the server and a component can
 * `useSuspenseQuery(...)` it on the client and share one cache entry, exactly
 * like the server-function setup this replaced.
 */
export const api = createTanstackQueryUtils(apiClient);
