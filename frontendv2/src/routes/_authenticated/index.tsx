import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, RefreshCw, AlertCircle, ShieldCheck, Inbox } from "lucide-react";
import { useDashboard, useAnalytics } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  DashboardStats,
  RecentActivity,
  UrgentAttention,
  DepartmentLoad,
  StatusOverview,
} from "@/components/dashboard";

export const Route = createFileRoute("/_authenticated/")({ component: DashboardPage });

function DashboardPage() {
  const {
    data: dashboard,
    isLoading: isDashLoading,
    error: dashError,
    refetch: refetchDash,
    isFetching: isDashFetching,
  } = useDashboard();

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
    isFetching: isAnalyticsFetching,
  } = useAnalytics();

  const isLoading = isDashLoading || isAnalyticsLoading;
  const isFetching = isDashFetching || isAnalyticsFetching;
  const hasError = Boolean(dashError || analyticsError);

  const handleRetry = () => {
    refetchDash();
    refetchAnalytics();
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (hasError || !dashboard) {
    return <DashboardErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Grievance Cell Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
              <ShieldCheck className="size-3 text-slate-700" /> Operational
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Live overview of incoming citizen petitions, AI classification status, and departmental workload.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isFetching}
            className="h-9 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <RefreshCw className={`mr-1.5 size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
          >
            <Link to="/inbox">
              <Inbox className="mr-1.5 size-3.5" />
              Open Petition Inbox
              <ArrowUpRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 1. Dashboard Key Metrics Row */}
      <DashboardStats dashboard={dashboard} analytics={analytics} />

      {/* 2. Grid Layout for Major Operational Modules */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols wide on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity petitions={dashboard.recent} />
          <StatusOverview analytics={analytics} />
        </div>

        {/* Right Column (1 col wide on large screens) */}
        <div className="space-y-6">
          <UrgentAttention urgent={dashboard.urgent} />
          <DepartmentLoad byDepartment={dashboard.by_department} />
        </div>
      </div>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 w-2/3 rounded-xl bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200/60" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 rounded-xl bg-slate-200/60" />
          <div className="h-60 rounded-xl bg-slate-200/60" />
        </div>
        <div className="space-y-6">
          <div className="h-60 rounded-xl bg-slate-200/60" />
          <div className="h-60 rounded-xl bg-slate-200/60" />
        </div>
      </div>
    </div>
  );
}

function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs my-8">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
        <AlertCircle className="size-6" />
      </div>
      <h2 className="text-base font-bold text-slate-900">Unable to load dashboard data</h2>
      <p className="mt-1 max-w-md text-xs text-slate-500">
        We encountered a problem fetching the latest petition telemetry from the backend service.
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="mt-5 rounded-xl border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50"
      >
        <RefreshCw className="mr-2 size-3.5" /> Retry Connection
      </Button>
    </div>
  );
}
