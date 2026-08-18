import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { preview } from "vite";
import type { TestProject } from "vitest/node";

/**
 * Builds the app and serves it for the smoke suite.
 *
 * `vite preview` runs the built Worker bundle inside workerd (via the
 * Cloudflare plugin), so the suite exercises the same runtime that gets
 * deployed rather than a Node stand-in.
 *
 * The mode comes from `SMOKE_MODE` and selects which `.config/.env.*` file the
 * build loads — CI runs this once per mode. Building here (rather than
 * expecting a `dist/` to already exist) keeps `pnpm test:smoke` a single
 * self-contained command locally and in CI, and guarantees the server under
 * test was built in the mode the assertions expect.
 */
const CONFIG_FILE = ".config/vite.config.ts";

export default async function setup(project: TestProject) {
  const mode = process.env.SMOKE_MODE ?? "production";

  // Shelling out rather than calling Vite's `build()` API: the Cloudflare
  // plugin builds the Worker environment in a nested build that doesn't
  // inherit a programmatically-passed `mode`, so the worker bundle silently
  // came out with production's env while the client had the right one. The CLI
  // propagates the flag correctly, and it's also the exact command CI and
  // `pnpm build` run.
  await promisify(execFile)("pnpm", [
    "exec",
    "vite",
    "build",
    "--config",
    CONFIG_FILE,
    "--mode",
    mode,
  ]);

  // Port 0 lets the OS pick a free one, so parallel runs (a CI matrix on a
  // shared runner, or a `pnpm dev` already holding 3000) can't collide.
  const server = await preview({ configFile: CONFIG_FILE, mode, preview: { port: 0 } });

  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error("preview server started without a local URL");

  // `provide` is how a global setup hands values to test files, which read them
  // back with `inject` — they run in separate worker processes, so a module
  // export or a `process.env` write wouldn't reach them.
  project.provide("smokeUrl", url.replace(/\/$/, ""));
  project.provide("smokeMode", mode);

  return async () => {
    await server.close();
  };
}

declare module "vitest" {
  interface ProvidedContext {
    smokeUrl: string;
    smokeMode: string;
  }
}
