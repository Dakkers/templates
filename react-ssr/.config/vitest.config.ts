import { defineConfig } from "vitest/config";

// Standalone config — deliberately does NOT extend `.config/vite.config.ts`.
// The app config loads the Cloudflare plugin, which would try to wrap the test
// runner in workerd; the smoke suite drives a *separately built* server over
// HTTP instead, and only needs a plain Node environment to run `fetch`.
//
// Like the Vite config, this file lives in `.config/` but leaves `root` at the
// project root, so every path below is written relative to that.
export default defineConfig({
  test: {
    name: "smoke",
    include: ["tests/smoke/**/*.test.ts"],
    // Builds the app and boots a preview server once for the whole suite; see
    // the file for which mode it picks up.
    globalSetup: ["tests/smoke/globalSetup.ts"],
    // A build plus a server boot is slower than a unit test's default 5s.
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
