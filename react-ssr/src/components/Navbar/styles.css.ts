import { style } from "@vanilla-extract/css";
import { vars } from "@saintly-software/baritone";
import { navbarHeight } from "#/styles/vars.css";

/*
 * Two sources of variables meet here, and the split is deliberate: `vars` is
 * Baritone's design-system contract (spacing scale, border widths, radii), while
 * `appVars` holds the handful of shell-only values the design system has no
 * opinion about. Neither is a raw string, so nothing here silently drifts.
 */
export const navbar = style({
  position: "sticky",
  top: 0,
  zIndex: 30,
  height: navbarHeight,
  // background: appVars.color.chrome,
  // borderBottom: `${vars.borderWidth.thin} solid ${appVars.color.hairline}`,
});

/** The brand mark. Strips the anchor's default decoration so the wordmark inside keeps its own type styles. */
export const brandLink = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space["2"],
  textDecoration: "none",
  color: "inherit",
});
