import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { BaritoneTheme, buildDefaultTokens } from "@saintly-software/baritone";

import { NotFound } from "../components/NotFound";
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
        {children}

        <Scripts />
      </BaritoneTheme>
    </html>
  );
}
