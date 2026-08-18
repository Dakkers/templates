import { defineConfig } from "vitest/config";

// Unit tests: fast, in-process, no build and no server. The counterpart is
// `vitest.smoke.config.ts`, which builds the app and drives it over HTTP —
// they're separate configs rather than one workspace so `pnpm test` stays
// instant and CI can report the two as distinct jobs.
//
// Like the Vite config, this file lives in `.config/` but leaves `root` at the
// project root, so every path below is written relative to that.
export default defineConfig({
  // Resolves the `#/*` alias from tsconfig, so tests import app modules the
  // same way the app does.
  resolve: { tsconfigPaths: true },
  test: {
    name: "unit",
    include: ["tests/unit/**/*.test.ts"],
    // The SSR runtime is Cloudflare Workers, so the code under test targets web
    // APIs (`crypto.subtle`, `TextEncoder`, `Response`) — all present in Node's
    // global scope. No jsdom: nothing here touches the DOM.
    environment: "node",
  },
});
