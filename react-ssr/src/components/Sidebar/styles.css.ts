import { style } from "@vanilla-extract/css";
import { vars } from "@saintly-software/baritone";
import { navbarHeight, sidebarWidth } from "#/styles/vars.css";
import { calc } from "@vanilla-extract/css-utils";

export const sidebar = style({
  width: sidebarWidth,
  flex: "none",
  boxSizing: "border-box",
  position: "sticky",
  top: navbarHeight,
  height: calc.subtract('100vh', navbarHeight)
});

export const navLink = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space["2"],
  padding: `${vars.space["2"]} ${vars.space["3"]}`,
  borderRadius: vars.radius.md,
  textDecoration: "none",
  color: vars.text.color.neutral.mid,
  fontSize: vars.text.variant.body.sm.fontSize,
  lineHeight: vars.text.variant.body.sm.lineHeight,

  ":hover": {
    background: vars.surface.color.neutral.high.default.bgc,
    color: vars.text.color.neutral.high,
  },

  selectors: {
    '&[data-active="true"]': {
      background: vars.surface.color.primary.low.default.bgc,
      color: vars.text.color.primary.high,
      fontWeight: vars.text.weight.semibold,
    },
  },
});
