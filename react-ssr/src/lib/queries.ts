/**
 * Query-options factory. Centralising `queryOptions` here means routes and
 * components share one source of truth for query keys and fetchers — a loader can
 * `ensureQueryData(q.items())` on the server and a component can
 * `useSuspenseQuery(q.items())` on the client and hit the same cache entry.
 */
import { queryOptions } from "@tanstack/react-query";
import { getItem, listItems } from "#/server/items";

export const q = {
  items: () =>
    queryOptions({
      queryKey: ["items"],
      queryFn: () => listItems(),
    }),

  item: (id: string) =>
    queryOptions({
      queryKey: ["items", id],
      queryFn: () => getItem({ data: { id } }),
    }),
};
