/**
 * Demo data server functions. These stand in for a real data layer so the query
 * + SSR wiring has something to fetch — replace the in-memory array with your
 * database (e.g. Cloudflare D1 + Drizzle) and keep the `requireAuth()` guard.
 *
 * Each function re-checks auth: a server function is a public endpoint, so the
 * route guard alone is not enough.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "./session";

export type Item = {
  id: string;
  title: string;
  note: string;
  done: boolean;
};

const ITEMS: Item[] = [
  {
    id: "welcome",
    title: "Read the README",
    note: "The tour of how this template fits together.",
    done: true,
  },
  {
    id: "routes",
    title: "Add a route",
    note: "Drop a file under src/routes — the tree regenerates.",
    done: false,
  },
  {
    id: "design",
    title: "Explore Baritone",
    note: "Swap these cards for your own UI from the design system.",
    done: false,
  },
  {
    id: "data",
    title: "Wire up a database",
    note: "Replace this in-memory list with D1 + Drizzle.",
    done: false,
  },
];

export const listItems = createServerFn().handler(async () => {
  await requireAuth();
  return ITEMS;
});

export const getItem = createServerFn()
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<Item | null> => {
    await requireAuth();
    return ITEMS.find((item) => item.id === data.id) ?? null;
  });
