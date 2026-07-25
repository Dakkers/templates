import { style } from "@vanilla-extract/css";
import { navbarHeight, sidebarWidth } from "./vars.css";

export const bodyStyle = style([{
    vars: {
        [navbarHeight]: '56px',
        [sidebarWidth]: '300px',
    }
}])