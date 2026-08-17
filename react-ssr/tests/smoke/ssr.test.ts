import { beforeAll, describe, expect, inject, it } from "vitest";

/**
 * Smoke tests: does a production-shaped build of this app actually serve a
 * server-rendered page? These run against a real preview server booted by
 * `tests/smoke/globalSetup.ts` — no mocks, no jsdom.
 *
 * Keep them shallow. The point is to catch a build that boots but is broken
 * (blank shell, wrong env file, 500 on the entry route), not to test features.
 */
const baseUrl = inject("smokeUrl");
const mode = inject("smokeMode");

describe(`SSR smoke (${mode})`, () => {
  let status: number;
  let contentType: string | null;
  let html: string;

  beforeAll(async () => {
    const response = await fetch(`${baseUrl}/`);
    status = response.status;
    contentType = response.headers.get("content-type");
    html = await response.text();
  });

  it("serves the landing page as HTML", () => {
    expect(status).toBe(200);
    expect(contentType).toMatch(/text\/html/);
  });

  it("server-renders the page content", () => {
    // The heading only reaches the wire if SSR ran — an empty hydration shell
    // would still return 200 with a valid <html> document, so assert on markup
    // the client would otherwise have to render.
    expect(html).toMatch(/<h1[^>]*>React SSR Template/);
  });

  it("renders the document shell with hydration scripts", () => {
    expect(html).toMatch(/<html[^>]*lang="en"/);
    expect(html).toMatch(/<script/);
  });

  it("injects the env vars for the build mode", () => {
    // `__root.tsx` renders VITE_APP_ENV into this meta tag and Vite inlines it
    // at build time from `.config/.env.<mode>`. Each of those files sets the
    // var to its own mode name, so a mismatch means the build loaded the wrong
    // file (or none) — which is exactly the misconfiguration that otherwise
    // only shows up after a deploy.
    expect(html).toContain(`<meta name="app-env" content="${mode}"/>`);
  });

  it("returns a 404 for an unknown route", () => {
    // Guards the not-found path specifically: a server that 500s here still
    // looks healthy on every assertion above.
    return expect(fetch(`${baseUrl}/definitely-not-a-route`)).resolves.toMatchObject({
      status: 404,
    });
  });
});
