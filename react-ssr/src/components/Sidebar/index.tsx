import { Link as RouterLink, useRouterState } from "@tanstack/react-router";
import { Divider, Flex } from "@saintly-software/baritone";
import {
  LayoutDashboard as DashboardIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import { navLink, sidebar } from "./styles.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
] as const;

function SidebarItem({
  to,
  icon: Icon,
  label,
  active,
  preload,
}: {
  to: string;
  icon: typeof DashboardIcon;
  label: string;
  active: boolean;
  /** Pass `false` for destinations that must not be visited speculatively. */
  preload?: false;
}) {
  return (
    <RouterLink
      to={to}
      preload={preload}
      className={navLink}
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} aria-hidden />
      <span>{label}</span>
    </RouterLink>
  );
}

/**
 * Sidebar — the sidebar for the authenticated shell. Highlights whichever nav
 * item matches the current location and closes with a log out link.
 */
export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Flex render={<aside />} direction="column" gap="4" py="4" px="3" className={sidebar}>
      <Flex render={<nav />} direction="column" gap="1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={isActive(item.to)}
          />
        ))}
      </Flex>

      <Flex.Item grow />
      <Divider />

      <SidebarItem
        to="/auth/logout"
        icon={LogOutIcon}
        label="Log out"
        active={false}
        preload={false}
      />
    </Flex>
  );
}
