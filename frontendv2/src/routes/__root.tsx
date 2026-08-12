import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";

function RootComponent() {
  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
