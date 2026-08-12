import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Building2,
  BarChart3,
  Search,
  Bell,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/lib/api";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/inbox", label: "Petition Inbox", icon: Inbox, exact: false },
  { to: "/departments", label: "Departments", icon: Building2, exact: false },
  { to: "/analytics", label: "Analytics", icon: BarChart3, exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: dashboard } = useDashboard();
  const [q, setQ] = useState("");
  const pending = dashboard?.pending ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-e1">
            <ShieldCheck className="size-5" />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-[15px] font-semibold">PetitionAI</span>
            <span className="text-[11px] text-muted-foreground">Government Grievance Cell</span>
          </span>
        </Link>

        <form
          className="relative ml-2 max-w-2xl flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/inbox", search: { q, status: "all", priority: "all", department: "all" } });
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search petitions by ID, subject, sender or department"
            className="h-11 rounded-full border-transparent bg-muted pl-11 text-sm focus-visible:border-transparent focus-visible:bg-card focus-visible:shadow-e2"
          />
        </form>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-info-soft px-3 py-1.5 text-xs font-medium text-accent-foreground md:inline-flex">
            <Sparkles className="size-3.5" /> Gemini analysis active
          </span>
          <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell className="size-5" />
            {pending > 0 && (
              <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
            )}
          </button>
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            AP
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col gap-1 border-r border-border bg-card px-3 py-4 lg:flex">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-[18px]" />
                {item.label}
                {item.to === "/inbox" && pending > 0 && (
                  <span className="ml-auto text-xs font-semibold">{pending}</span>
                )}
              </Link>
            );
          })}

          <div className="mt-6 rounded-xl bg-muted p-4">
            <p className="text-xs font-semibold text-foreground">Intake pipeline</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Email → Zapier → FastAPI → Gemini classification → officer review.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="sticky bottom-0 z-30 flex border-t border-border bg-card lg:hidden">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
