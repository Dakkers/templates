/**
 * Query-options factory. Centralising `queryOptions` here means routes and
 * components share one source of truth for query keys and fetchers — a loader can
 * `ensureQueryData(q.items())` on the server and a component can
 * `useSuspenseQuery(q.items())` on the client and hit the same cache entry.
 *
 * The fetchers are the typed oRPC client (`#/lib/orpc/client`) talking to the
 * upstream REST API. `api.items.list.queryOptions()` already returns a
 * `queryOptions` object; this thin `q` facade just gives the app one stable
 * import surface, so changing the transport underneath never ripples out into
 * every route that reads data.
 */
import { api } from "#/lib/orpc/client";

export const q = {
  items: () => api.items.list.queryOptions(),

  item: (id: string) => api.items.find.queryOptions({ input: { id } }),
};
