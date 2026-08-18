/**
 * Contract stub — a stand-in for the API contract you'd get from a published
 * package.
 *
 * In a real project you DELETE this file and import the contract from the
 * package your API publishes, e.g.:
 *
 *     import { contract } from "@your-org/api-contract";
 *
 * then re-point the import in `./client` at it. The contract is the single
 * source of truth shared by both sides: the API server builds its handlers from
 * it, and this frontend derives a fully-typed client from it. As long as the
 * published `contract` is an oRPC contract router of the same shape, nothing
 * else under `src/lib/orpc` has to change.
 *
 * It's modelled REST-first: every procedure declares an HTTP `method` + `path`
 * via `.route()`, which is what lets `OpenAPILink` (in `./client`) turn a call
 * like `client.items.find({ id })` into `GET /items/{id}` against your REST API.
 */
import { oc } from "@orpc/contract";
import { z } from "zod";

const Item = z.object({
  id: z.string(),
  title: z.string(),
  note: z.string(),
  done: z.boolean(),
});

export const contract = {
  items: {
    /** GET /items — list every item. */
    list: oc.route({ method: "GET", path: "/items" }).output(z.array(Item)),

    /**
     * GET /items/{id} — fetch one item. The `{id}` path segment is filled from
     * the input field of the same name. A missing item is a 404, which surfaces
     * on the client as a thrown `ORPCError` (see the error note in `./client`).
     */
    find: oc
      .route({ method: "GET", path: "/items/{id}" })
      .input(z.object({ id: z.string() }))
      .output(Item),
  },
};
