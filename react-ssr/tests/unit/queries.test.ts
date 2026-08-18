import { describe, expect, it } from "vitest";
import { q } from "#/lib/queries";

/**
 * The query-options factory exists so a route loader's `ensureQueryData` and a
 * component's `useSuspenseQuery` land on the same cache entry. That only holds
 * if the keys are stable and unique per resource — a drifting key doesn't throw,
 * it just silently refetches on the client after SSR already had the data.
 *
 * These assert the key shape only; the fetchers are server functions, and
 * calling them needs a request context (that's the smoke suite's job).
 */
describe("query keys", () => {
  it("uses a stable key for the item list", () => {
    expect(q.items().queryKey).toEqual(["items"]);
    expect(q.items().queryKey).toEqual(q.items().queryKey);
  });

  it("scopes a single item under the list key", () => {
    // Nesting under ["items"] means invalidating the list also invalidates the
    // individual entries.
    expect(q.item("welcome").queryKey).toEqual(["items", "welcome"]);
  });

  it("gives different ids different keys", () => {
    expect(q.item("welcome").queryKey).not.toEqual(q.item("routes").queryKey);
  });
});
