import { Link as RouterLink } from "@tanstack/react-router";
import { Flex, Heading } from "@saintly-software/baritone";
import { Boxes as LogoIcon } from "lucide-react";
import { brandLink, navbar } from "./styles.css";

/**
 * Navbar — the sticky top bar for the authenticated shell. Holds the brand mark,
 * which doubles as a link home.
 */
export function Navbar() {
  return (
    <Flex render={<header />} align="center" gap="3" px="6" className={navbar}>
      <RouterLink to="/dashboard" className={brandLink}>
        <LogoIcon size={22} aria-hidden />
        <Heading level={1} size="lg">
          React SSR
        </Heading>
      </RouterLink>
    </Flex>
  );
}
