# React SSR Template

A server-rendered React starter built on **[TanStack Start](https://tanstack.com/start)**
(SSR + file-based routing) running on **Cloudflare Workers**, with the
**[Baritone](https://www.npmjs.com/package/@saintly-software/baritone)** design
system, **TanStack Query**, **lucide** icons, and a cookie-session auth gate.

Single package — no monorepo — with supply-chain hardening, lint/format config,
and CI wired up from the start.

## Tech stack

| Concern           | Choice                                                   |
| ----------------- | -------------------------------------------------------- |
| Framework / SSR   | TanStack Start + TanStack Router (file-based)            |
| Runtime / hosting | Cloudflare Workers (`@cloudflare/vite-plugin`, Wrangler) |
| API client        | oRPC (contract-first, REST via `OpenAPILink`)            |
| Data fetching     | TanStack Query, hydrated through the SSR stream          |
| Design system     | `@saintly-software/baritone` (+ `@base-ui/react`)        |
| Icons             | `lucide-react`                                           |
| Validation        | `zod`                                                    |
| Lint / format     | `oxlint` / `oxfmt`                                       |
| Package manager   | pnpm                                                     |

## Getting started

Requires the Node version in [`.nvmrc`](.nvmrc) (`nvm use`) and pnpm.

```bash
pnpm install
pnpm dev
```

That serves the app at http://localhost:3000. The demo login password is
`password` (see [Auth model](#auth-model) to set real secrets).

## Layout

```
.
├── src/
│   ├── routes/            # file-based routes (the tree is generated → routeTree.gen.ts)
│   ├── server/            # server functions (auth/session) — run only on the server
│   ├── data/              # data layer: oRPC client + query-options factory
│   │   ├── client.ts      #   typed oRPC client for the upstream REST API
│   │   └── queries.ts     #   query-options factory (the loader ↔ component seam)
│   ├── lib/               # shared helpers
│   │   └── contract.ts    #   API contract stub (stand-in for a published package)
│   ├── components/        # UI building blocks
│   ├── router.tsx         # router + SSR-query integration
│   └── styles/            # reset + Baritone's CSS, and the app-shell tokens (theme.css.ts)
├── tests/
│   ├── unit/              # fast in-process tests (`pnpm test`)
│   └── smoke/             # builds the app, boots it, drives it over HTTP
├── public/                # static assets served as-is
├── .github/workflows/     # CI: quality-check, unit-test, build, smoke-test + PR-title lint
├── .github/actions/setup/ # composite action: pnpm + Node + cached install
├── .changeset/            # changeset files + config (versioning / changelog)
├── .config/               # tool config, kept out of the root
│   ├── vite.config.ts     # Vite + TanStack Start + Cloudflare plugins
│   ├── vitest.config.ts   # both test suites, as vitest projects
│   ├── wrangler.jsonc     # Cloudflare Workers config
│   ├── .oxlintrc.json     # oxlint rules
│   ├── .oxfmtrc.json      # oxfmt options
│   ├── .env*              # Vite env vars (VITE_-prefixed reach the client)
│   └── .dev.vars.example  # template for .config/.dev.vars (local Worker secrets)
├── pnpm-workspace.yaml    # not a workspace — holds pnpm's supply-chain settings
├── tsr.config.json        # TanStack Router codegen — must stay in the root
└── tsconfig.json          # must stay in the root (editors resolve it upward)
```

Everything in `.config/` is wired up through the `package.json` scripts, so the
commands below work unchanged. Two configs cannot move: `tsconfig.json`, because
editors and Vite discover it by walking up from each source file, and
`tsr.config.json`, which the TanStack Router CLI and Vite plugin only ever read
from the project root.

## Scripts

| Script                   | What it does                                              |
| ------------------------ | --------------------------------------------------------- |
| `pnpm dev`               | Start the dev server (http://localhost:3000)              |
| `pnpm build`             | Production build                                          |
| `pnpm preview`           | Build, then preview the built Worker locally              |
| `pnpm deploy`            | Build + `wrangler deploy` (needs a Cloudflare account)    |
| `pnpm generate-routes`   | Regenerate `src/routeTree.gen.ts` by hand                 |
| `pnpm cf-typegen`        | Regenerate `worker-configuration.d.ts` from bindings      |
| `pnpm typecheck`         | `tsc --noEmit`                                            |
| `pnpm test` / `:watch`   | Unit tests (vitest, in-process)                           |
| `pnpm test:smoke`        | Build + boot the app, then assert it really serves SSR    |
| `pnpm test:all`          | Both suites in one run                                    |
| `pnpm lint` / `:check`   | `oxlint` (with/without `--fix`)                           |
| `pnpm fmt` / `:check`    | `oxfmt` (write/check)                                     |
| `pnpm changeset`         | Record a change (writes a markdown file to `.changeset/`) |
| `pnpm changeset:version` | Consume changesets: bump `version`, write `CHANGELOG.md`  |

Changesets is set up for versioning and changelogs only — the package is
`private`, so nothing is ever published to a registry. `changeset version` still
bumps it (changesets versions private packages by default). `baseBranch` in
[.changeset/config.json](.changeset/config.json) is `main`; change it if your
default branch differs.

## How TanStack Start is initialized

Two files wire up the framework:

- **[`src/router.tsx`](src/router.tsx)** — creates the router, seeds its context
  with a React Query `QueryClient`, and calls `setupRouterSsrQueryIntegration` so
  query data fetched in a loader on the server is dehydrated into the HTML stream
  and rehydrated on the client (no double-fetch). `defaultPreload: 'intent'` plus
  a non-zero `staleTime` means hovering a link warms the cache cheaply.
- **[`src/routes/__root.tsx`](src/routes/__root.tsx)** — the root route. Its
  `shellComponent` renders the whole HTML document, and `buildDefaultTokens` +
  `<BaritoneTheme render={<body />}>` apply the design system's theme to `<body>`.

## Routing conventions

Routes are files under [`src/routes/`](src/routes/); the tree is generated into
`src/routeTree.gen.ts` (committed, and regenerated automatically on dev/build).

**Nested routes live in folders.** A directory becomes a path segment and an
`index.tsx` is that segment's page:

```
src/routes/
├── __root.tsx                         # document shell + theme
├── index.tsx                          # "/"        public landing
├── auth/login/index.tsx               # "/auth/login"  sets the session cookie
└── _authenticated/                    # pathless layout — the auth gate
    ├── route.tsx                      #   the gate + app shell (navbar/sidebar)
    ├── dashboard/index.tsx            # "/dashboard"
    ├── items/
    │   ├── index.tsx                  # "/items"
    │   └── $itemId/index.tsx          # "/items/:itemId"  dynamic segment in a folder
    └── settings/index.tsx             # "/settings"
```

**The `_authenticated` gate.** The leading underscore makes `_authenticated` a
_pathless layout route_: it wraps its children with shared chrome and a guard
**without** adding `/_authenticated` to the URL. Its `beforeLoad`
([`route.tsx`](src/routes/_authenticated/route.tsx)) checks the session once and
`throw redirect({ to: '/auth/login' })`s when signed out — so every nested route
(`/dashboard`, `/items`, …) is protected by a single gate, and they render inside
the shared navbar + sidebar shell.

## Auth model

A minimal, dependency-free cookie session — swap it for real auth when you need it:

- [`src/server/session.ts`](src/server/session.ts) — a signed, httpOnly cookie via
  `useSession`, plus a constant-time password check and a `requireAuth()` helper.
- [`src/server/auth.ts`](src/server/auth.ts) — `login` / `logout` / `getAuth`
  server functions.

The login checks a single shared password. **The route guard only protects
navigations** — each data server function calls `requireAuth()` itself, because a
server function is a public endpoint.

### Secrets

Read from the environment (surfaced on `process.env` under `nodejs_compat`), with
insecure dev fallbacks so the app runs with zero setup:

- `SESSION_SECRET` — signs the session cookie (use ≥ 32 random chars).
- `APP_PASSWORD` — the demo login password (defaults to `password`).

Locally, copy `.config/.dev.vars.example` → `.config/.dev.vars` and fill them in.
Wrangler looks for `.dev.vars` next to its config file, so it belongs in
`.config/`, not the project root. In production,
set them as Wrangler secrets:

```bash
wrangler secret put SESSION_SECRET
wrangler secret put APP_PASSWORD
```

## Data fetching

[`src/data/queries.ts`](src/data/queries.ts) centralises `queryOptions` so a route
loader and a component share one cache entry:

```ts
// in a route
loader: ({ context }) => context.queryClient.ensureQueryData(q.items()), // server
// in the component
const { data } = useSuspenseQuery(q.items())                            // reads cache
```

The fetchers are the typed **oRPC client** ([`src/data/`](src/data/)), which calls
an upstream REST API — so the same `q.items()` runs on the server during the
loader and on the client after hydration, hitting one cache entry.
See [Talking to the API](#talking-to-the-api-orpc) for how the client is wired.

## Talking to the API (oRPC)

Domain data comes from a separate REST API, consumed **contract-first** with
[oRPC](https://orpc.unnoq.com/). The contract — an oRPC contract router that maps
each procedure to an HTTP method + path — is the single source of truth shared by
the API server and this frontend. This template assumes the API **publishes that
contract as a package**, so the client re-types itself the moment the API changes.

Three small files, split by ownership — the repo-specific wiring lives in
[`src/data/`](src/data/); the contract stub sits in [`src/lib/`](src/lib/)
because it stands in for a third-party package:

- **[`src/lib/contract.ts`](src/lib/contract.ts)** — a stand-in contract so the
  template builds and runs out of the box. **Delete it in a real project** and
  import the contract from the API's published package instead:

  ```ts
  // src/data/client.ts
  import { contract } from "@your-org/api-contract"; // ← was "#/lib/contract"
  ```

  Because the API is REST, `OpenAPILink` reads the `{ method, path }` on each
  procedure and turns a call like `apiClient.items.find({ id })` into
  `GET /items/{id}`.

- **[`src/data/client.ts`](src/data/client.ts)** — builds the client from the
  contract and exports two things:
  - `apiClient` — a plain promise client (`await apiClient.items.list()`) for
    mutations or one-off calls.
  - `api` — TanStack Query utils (`api.items.list.queryOptions()`) that slot into
    loaders and `useSuspenseQuery`. [`src/data/queries.ts`](src/data/queries.ts)
    is a thin facade over these.

  The module is **isomorphic** — one build runs both in the Worker (SSR) and the
  browser — so it handles two environment-specific concerns:
  - **Base URL.** The browser uses `VITE_API_URL` (inlined at build time); the
    server may override it with a private origin via `API_URL`.
  - **Auth.** Auth is a cookie shared with the API. In the browser it rides along
    via `credentials: "include"`; during SSR there's no cookie jar, so the client
    forwards the incoming request's `Cookie` header. (The forwarding code is
    server-only and is tree-shaken out of the client bundle by an
    `import.meta.env.SSR` guard.)

Point the client at your API with `VITE_API_URL` (per mode in
[`.config/.env.*`](.config/)) and, optionally, a server-side `API_URL`
([`.config/.dev.vars.example`](.config/.dev.vars.example)). Cross-origin browser
calls need the API to send `Access-Control-Allow-Credentials: true` with a
specific (non-`*`) `Access-Control-Allow-Origin`.

> Auth to _this app_ (the login gate) stays a cookie-session server function —
> see [Auth model](#auth-model). oRPC is only for the external data API.

## Baritone

Components and theming come from `@saintly-software/baritone` (built on
`@base-ui/react`). A few conventions:

- **Navigation** uses the `Link` component with `render` to wrap the router's link
  — `<Link render={<RouterLink to="/x" />}>` (inline) or
  `<Link appearance="button" …>` (button-styled). `Button` is for real actions
  (`onClick`, `type="submit"`), not navigation.
- **Colour** is expressed with `intent` (primary/neutral/positive/…) and `saliency`
  (high/mid/low) rather than raw colours.

## Supply-chain hardening

[`pnpm-workspace.yaml`](pnpm-workspace.yaml) holds defensive install settings (it's
kept purely for these — the project is a single package, not a workspace):

- **`minimumReleaseAge: 1440`** — ignore versions published < 24h ago.
- **`blockExoticSubdeps: true`** — refuse off-registry transitive deps.
- **`trustPolicy: no-downgrade`** — never resolve below a version with stronger
  publish-time trust evidence (e.g. provenance).
- **`savePrefix: ''`** — pin exact versions on `pnpm add`.
- **`allowBuilds`** — an allowlist for install/build scripts.

These will occasionally, and deliberately, block an install. Two escape hatches,
used sparingly and by exact version: **`minimumReleaseAgeExclude`** (trusted deps
newer than the age window — Baritone is opted out this way) and
**`trustPolicyExclude`** (benign provenance gaps, common for `@types/*`). When an
install fails, the error names the package and the setting to use.

## Deploy (Cloudflare Workers)

```bash
pnpm deploy         # build + wrangler deploy
```

Needs a Cloudflare account and `wrangler login`. Config is in
[`.config/wrangler.jsonc`](.config/wrangler.jsonc). Note that `wrangler deploy`
takes no `--config` flag here: `pnpm build` writes a redirect at
`.wrangler/deploy/config.json` pointing Wrangler at the built worker, and that
redirect is only found when Wrangler runs from the project root.

## Adding a database

Domain data lives behind the [oRPC API](#talking-to-the-api-orpc), so the Worker
itself ships no persistence. If you also need Worker-local storage (caching,
sessions, small lookups), add [Cloudflare D1](https://developers.cloudflare.com/d1/):

1. Add a `d1_databases` binding in `.config/wrangler.jsonc`.
2. Run `pnpm cf-typegen` to regenerate `worker-configuration.d.ts` with the
   binding's types, and add it to `tsconfig.json`'s `include`/`types`.
3. Read the binding from `cloudflare:workers`
   (`import { env } from 'cloudflare:workers'`) inside your server functions, e.g.
   with [Drizzle](https://orm.drizzle.team/).

## CI

[`.github/workflows/quality-check.yml`](.github/workflows/quality-check.yml) runs
`fmt:check`, `lint:check`, `typecheck` and the unit tests on every push to `main`
and every PR. On PRs it additionally builds every mode (`development`,
`staging`, `production`) and runs the smoke suite against each — the jobs are
split so a red check names what broke rather than just "CI failed". All of them
share [`.github/actions/setup`](.github/actions/setup/action.yml), which installs
pnpm + Node and caches both the pnpm store and `node_modules`.

### Tests

The two suites are Vitest [projects](https://vitest.dev/guide/projects) in a
single [.config/vitest.config.ts](.config/vitest.config.ts), selected with
`--project`. `pnpm test` is the unit one: pure logic, no build, runs in a
fraction of a second. `pnpm test:smoke` is the slower one — it builds the app in `SMOKE_MODE`
(default `production`), boots the built Worker under `vite preview`, and asserts
over real HTTP that the page is server-rendered and that the right
`.config/.env.*` file was baked in. Point it at another mode with
`SMOKE_MODE=staging pnpm test:smoke`.

[`pr-title.yml`](.github/workflows/pr-title.yml) enforces
[Conventional Commits](https://www.conventionalcommits.org/) on PR titles.
