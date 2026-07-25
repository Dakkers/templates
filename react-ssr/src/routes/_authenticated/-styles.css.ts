import { navbarHeight } from "#/styles/vars.css";
import { style } from "@vanilla-extract/css";
import { calc } from '@vanilla-extract/css-utils';

export const shell = style({
  minHeight: "100vh",
});

export const shellBody = style({
  display: "flex",
  alignItems: "flex-start",
  minHeight: calc.subtract('100vh', navbarHeight)
});

export const shellMain = style({
  flex: 1,
  minWidth: 0,
});
