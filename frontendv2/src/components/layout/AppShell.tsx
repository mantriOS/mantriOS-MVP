import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Building2,
  BarChart3,
  Search,
  Bell,
  ShieldCheck,
  LogOut,
  Menu,
  User,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDashboard } from "@/services/api";
import { removeStoredToken } from "@/services/authService";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/inbox", label: "Petition Inbox", icon: Inbox, exact: false, matchPrefixes: ["/inbox", "/petitions"] },
  { to: "/departments", label: "Departments", icon: Building2, exact: false, matchPrefixes: ["/departments"] },
  { to: "/analytics", label: "Analytics", icon: BarChart3, exact: false, matchPrefixes: ["/analytics"] },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: dashboard } = useDashboard();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const pending = dashboard?.pending ?? 0;

  const handleLogout = () => {
    removeStoredToken();
    navigate({ to: "/login" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({
        to: "/inbox",
        search: { q: q.trim(), status: "all", priority: "all", department: "all" },
      });
    } else {
      navigate({ to: "/inbox" });
    }
  };

  const isNavActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.exact) {
      return pathname === item.to;
    }
    return item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Sheet Drawer Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-white">
              <SheetHeader className="border-b border-slate-100 px-6 py-4">
                <SheetTitle className="flex items-center gap-3 text-left">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-base font-bold text-slate-900">MantriOS</span>
                    <span className="text-xs font-medium text-slate-500">Government Grievance Cell</span>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col justify-between h-[calc(100vh-5rem)] p-4">
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const active = isNavActive(item);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.to === "/inbox" && pending > 0 && (
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-bold",
                            active ? "bg-amber-400 text-slate-950" : "bg-amber-100 text-amber-900"
                          )}>
                            {pending}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-slate-200 bg-slate-200 text-slate-800">
                      <AvatarFallback className="font-semibold text-xs">OC</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs font-bold text-slate-900">Officer in Charge</span>
                      <span className="truncate text-[11px] text-slate-500">Minister's Office</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-start text-xs border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  >
                    <LogOut className="mr-2 size-3.5" /> Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop & Mobile Header Brand */}
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <ShieldCheck className="size-5" />
            </span>
            <div className="hidden flex-col leading-none sm:flex">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold tracking-tight text-slate-900">
                  MantriOS
                </span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Government Grievance Cell
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <form
          className="relative mx-4 max-w-lg flex-1 hidden md:block"
          onSubmit={handleSearchSubmit}
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search petitions by subject, sender ID or department..."
            className="h-9 w-full rounded-full border-slate-200 bg-slate-50 pl-9 pr-12 text-xs placeholder:text-slate-400 focus-visible:border-primary focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            ⌘K
          </span>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Status Badge */}
          <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-200/60 xl:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>AI Classifier Active</span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => navigate({ to: "/inbox" })}
            className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
            title={pending > 0 ? `${pending} pending petitions require action` : "No pending petitions"}
          >
            <Bell className="size-4 sm:size-5" />
            {pending > 0 && (
              <span className="absolute right-1 top-1 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-amber-500"></span>
              </span>
            )}
          </button>

          {/* User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 rounded-full px-2 hover:bg-slate-100 focus-visible:ring-0">
                <Avatar className="size-8 border border-slate-200 bg-slate-900 text-white">
                  <AvatarFallback className="font-semibold text-xs text-white bg-slate-900">OC</AvatarFallback>
                </Avatar>
                <span className="hidden text-xs font-semibold text-slate-700 sm:inline-block">
                  Officer in Charge
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold leading-none text-slate-900">Officer in Charge</p>
                  <p className="text-[11px] leading-none text-slate-500">officer@kerala.gov.in</p>
                  <span className="mt-1 inline-block text-[10px] font-medium text-slate-600">
                    Minister's Personal Section
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate({ to: "/" })}>
                  <LayoutDashboard className="mr-2 size-4 text-slate-500" />
                  <span>Dashboard Overview</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/inbox" })}>
                  <Inbox className="mr-2 size-4 text-slate-500" />
                  <span>Petition Inbox</span>
                  {pending > 0 && (
                    <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                      {pending}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/departments" })}>
                  <Building2 className="mr-2 size-4 text-slate-500" />
                  <span>Departments Directory</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/analytics" })}>
                  <BarChart3 className="mr-2 size-4 text-slate-500" />
                  <span>Performance Analytics</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                <LogOut className="mr-2 size-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 lg:flex">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Grievance Navigation
              </p>
              <nav className="mt-2 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = isNavActive(item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
                        active
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.to === "/inbox" && pending > 0 && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-bold",
                            active ? "bg-amber-400 text-slate-950" : "bg-amber-100 text-amber-900"
                          )}
                        >
                          {pending}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Status Info Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between text-slate-800 font-bold">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="size-3.5 text-amber-600" /> Auto-Triage
                </span>
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] text-slate-700">
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Petitions received via Zapier are auto-summarized and routed to priority queues.
              </p>
            </div>
          </div>

          {/* Desktop Sidebar Officer Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-slate-200 bg-slate-900 text-white">
                <AvatarFallback className="font-semibold text-xs text-white bg-slate-900">OC</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-xs font-bold text-slate-900">Officer in Charge</span>
                <span className="truncate text-[10px] text-slate-500">Grievance Portal</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-center text-xs h-8 border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
              <LogOut className="mr-1.5 size-3.5" /> Sign Out
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="sticky bottom-0 z-40 flex border-t border-slate-200 bg-white py-1.5 lg:hidden shadow-lg">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label.split(" ")[0]}</span>
              {item.to === "/inbox" && pending > 0 && (
                <span className="absolute top-1 right-1/4 flex size-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

