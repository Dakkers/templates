import { describe, expect, it } from "vitest";
import { q } from "#/data/queries";

/**
 * The query-options factory exists so a route loader's `ensureQueryData` and a
 * component's `useSuspenseQuery` land on the same cache entry. That only holds
 * if the keys are stable per resource and distinct across resources — a drifting
 * or colliding key doesn't throw, it just silently refetches (or serves the
 * wrong entry) on the client after SSR already had the data.
 *
 * oRPC's TanStack Query utils generate the keys, so these assert the guarantees
 * the seam depends on — stability and uniqueness — rather than oRPC's exact key
 * shape, which is an internal detail. The fetchers hit a live REST API, so
 * exercising them is the smoke suite's job, not this one.
 */
describe("query keys", () => {
  it("is stable for the item list across calls", () => {
    expect(q.items().queryKey).toEqual(q.items().queryKey);
  });

  it("derives the key from the 'items' resource", () => {
    expect(JSON.stringify(q.items().queryKey)).toContain("items");
  });

  it("is stable for a given id across calls", () => {
    expect(q.item("welcome").queryKey).toEqual(q.item("welcome").queryKey);
  });

  it("gives the list and a single item distinct keys", () => {
    expect(q.item("welcome").queryKey).not.toEqual(q.items().queryKey);
  });

  it("gives different ids different keys", () => {
    expect(q.item("welcome").queryKey).not.toEqual(q.item("routes").queryKey);
  });
});
