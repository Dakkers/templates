import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { BaritoneProvider, BaritoneTheme, buildDefaultTokens } from "@saintly-software/baritone";

import { NotFound } from "../components/NotFound";
import { toastManager } from "../lib/toast";
import resetCss from "../styles/reset.css?url";
import appCss from "../styles/styles.css?url";
import { bodyStyle } from "#/styles/root.css";

const APP_NAME = "React SSR Template";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      // Which `.config/.env.*` file the bundle was built against, inlined by
      // Vite at build time. Non-secret by definition (it's a `VITE_`-prefixed
      // var, so it ships to the client either way), and the CI smoke test reads
      // it back out of the SSR'd HTML to prove the right mode was loaded.
      { name: "app-env", content: import.meta.env.VITE_APP_ENV },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: resetCss },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const tokens = buildDefaultTokens("light");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <BaritoneTheme tokens={tokens} scheme="light" render={<body className={bodyStyle} />}>
        {/* BaritoneProvider owns the client-side toast system (Toast.Provider +
            viewport). It lives inside BaritoneTheme so the body-mounted viewport
            resolves its tokens from the theme class on <body>. The shared
            `toastManager` lets non-React code — the global mutation-error handler
            in `#/router` — fire toasts through this same viewport. */}
        <BaritoneProvider toastManager={toastManager}>{children}</BaritoneProvider>

        <Scripts />
      </BaritoneTheme>
    </html>
  );
}
