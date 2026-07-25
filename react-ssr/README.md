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
│   ├── server/            # server functions (auth, data) — run only on the server
│   ├── lib/               # shared client helpers (query options)
│   ├── components/        # UI building blocks
│   ├── router.tsx         # router + SSR-query integration
│   └── styles/            # reset + Baritone's CSS, and the app-shell tokens (theme.css.ts)
├── public/                # static assets served as-is
├── .github/workflows/     # CI: quality-check (fmt/lint/typecheck) + PR-title lint
├── .changeset/            # changeset files + config (versioning / changelog)
├── .config/               # tool config, kept out of the root
│   ├── vite.config.ts     # Vite + TanStack Start + Cloudflare plugins
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

[`src/lib/queries.ts`](src/lib/queries.ts) centralises `queryOptions` so a route
loader and a component share one cache entry:

```ts
// in a route
loader: ({ context }) => context.queryClient.ensureQueryData(q.items()), // server
// in the component
const { data } = useSuspenseQuery(q.items())                            // reads cache
```

The fetchers are TanStack Start **server functions**
([`src/server/items.ts`](src/server/items.ts)) — they run only on the server. Today
they return an in-memory list; replace it with a real data layer (see below) and
keep the `requireAuth()` guard.

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

This template ships no persistence on purpose. To add
[Cloudflare D1](https://developers.cloudflare.com/d1/):

1. Add a `d1_databases` binding in `.config/wrangler.jsonc`.
2. Run `pnpm cf-typegen` to regenerate `worker-configuration.d.ts` with the
   binding's types, and add it to `tsconfig.json`'s `include`/`types`.
3. Read the binding from `cloudflare:workers`
   (`import { env } from 'cloudflare:workers'`) inside your server functions, e.g.
   with [Drizzle](https://orm.drizzle.team/).

## CI

[`.github/workflows/quality-check.yml`](.github/workflows/quality-check.yml) runs
`fmt:check`, `lint:check`, and `typecheck` on every push to `main` and every PR.
[`pr-title.yml`](.github/workflows/pr-title.yml) enforces
[Conventional Commits](https://www.conventionalcommits.org/) on PR titles.
