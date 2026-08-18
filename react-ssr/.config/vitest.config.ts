import { defineConfig } from "vitest/config";

// Two suites, one config, via Vitest projects. `--project unit` / `--project
// smoke` select between them (see the `test*` scripts in package.json), and a
// bare `vitest run` executes both under a single reporter.
//
// They're projects rather than one flat config because they differ in kind:
// the unit suite is in-process and instant, while the smoke suite builds the
// app and boots a server before it asserts anything. Splitting them keeps
// `pnpm test` from ever triggering a build.
//
// Like the Vite config, this file lives in `.config/` but leaves `root` at the
// project root, so every path below is written relative to that.
export default defineConfig({
  test: {
    projects: [
      {
        // Resolves the `#/*` alias from tsconfig, so tests import app modules
        // the same way the app does.
        resolve: { tsconfigPaths: true },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          // The SSR runtime is Cloudflare Workers, so the code under test
          // targets web APIs (`crypto.subtle`, `TextEncoder`, `Response`) —
          // all present in Node's global scope. No jsdom: nothing here touches
          // the DOM.
          environment: "node",
        },
      },
      {
        test: {
          name: "smoke",
          include: ["tests/smoke/**/*.test.ts"],
          environment: "node",
          // Builds the app and boots a preview server once for the whole
          // project; see the file for which mode it picks up.
          globalSetup: ["tests/smoke/globalSetup.ts"],
          // A build plus a server boot is slower than a unit test's default 5s.
          testTimeout: 30_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
});
