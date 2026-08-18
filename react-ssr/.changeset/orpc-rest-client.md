---
"react-ssr": minor
---

Add a contract-first oRPC client for talking to an upstream REST API. The
`items` data layer now flows through `src/lib/orpc` (contract stub → `OpenAPILink`
client → TanStack Query utils) instead of an in-memory server function, keeping
one isomorphic query that runs during SSR and after hydration. The contract is a
replaceable stand-in for the API's published contract package, and the client
forwards the auth cookie to the API on the server. Auth to the app itself stays a
cookie-session server function.
