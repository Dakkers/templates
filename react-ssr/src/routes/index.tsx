import { Flex, Heading, Link, Text } from "@saintly-software/baritone";
import { Link as RouterLink, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main
      style={{ maxWidth: "40rem", margin: "6rem auto 0", padding: "0 1.5rem", textAlign: "center" }}
    >
      <Flex direction="column" align="center" gap="6">
        <Flex direction="column" align="center" gap="4">
          <Heading level={1} variant="4xl">
            React SSR Template
          </Heading>
          <Text variant="lg" saliency="low">
            TanStack Start on Cloudflare Workers, with the Baritone design system, TanStack Query,
            and a cookie-session auth gate — ready to build on.
          </Text>
        </Flex>

        <Flex gap="3" justify="center">
          {/* Baritone's `Link` integrates any router via `render` — here TanStack
              Router's <Link>. `appearance="button"` gives it Button styling. */}
          <Link appearance="button" render={<RouterLink to="/auth/login" />}>
            Log in
          </Link>
          <Link
            appearance="button"
            intent="neutral"
            saliency="low"
            render={<RouterLink to="/dashboard" />}
          >
            Go to dashboard
          </Link>
        </Flex>

        <Text variant="sm" saliency="low">
          The demo password is <strong>password</strong> (set <code>APP_PASSWORD</code> to change
          it).
        </Text>
      </Flex>
    </main>
  );
}
