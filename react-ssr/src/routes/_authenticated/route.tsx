import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getAuth } from "#/server/auth";
import { Navbar } from "#/components/Navbar";
import { Sidebar } from "#/components/Sidebar";
import { shell, shellBody, shellMain } from "./-styles.css";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { authed } = await getAuth();
    if (!authed) throw redirect({ to: "/auth/login" });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className={shell}>
      <Navbar />

      <div className={shellBody}>
        <Sidebar />

        <main className={shellMain}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
