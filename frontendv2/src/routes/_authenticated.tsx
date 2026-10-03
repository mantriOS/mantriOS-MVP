import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getStoredToken } from "@/services/authService";

/**
 * Pathless layout route for protected internal application views.
 *
 * AUTHENTICATION BOUNDARY ARCHITECTURE:
 * When real authentication endpoints are deployed on the FastAPI backend
 * (e.g. POST /api/v1/auth/login and token validation), uncomment the `beforeLoad`
 * redirect guard below to enforce mandatory session authentication.
 */

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Enable token redirect guard once backend authentication endpoints are live:
    // const token = getStoredToken();
    // if (!token && location.pathname !== "/login") {
    //   throw redirect({ to: "/login" });
    // }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
