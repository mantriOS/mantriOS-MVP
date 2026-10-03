import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useAnalytics } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  AnalyticsOverview,
  StatusDistributionChart,
  PriorityDistributionChart,
  DepartmentDistributionChart,
  AnalyticsSkeleton,
  AnalyticsErrorState,
  AnalyticsEmptyState,
} from "@/components/analytics";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: analytics, isLoading, error, refetch, isFetching } = useAnalytics();

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !analytics) {
    return <AnalyticsErrorState onRetry={() => refetch()} />;
  }

  if (analytics.total === 0 && analytics.by_department.length === 0) {
    return <AnalyticsEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Grievance Telemetry & Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
              <ShieldCheck className="size-3 text-slate-700" />
              Live Telemetry
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Operational overview of petition distribution, AI priority triage, and resolution rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`mr-1.5 size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* 1. Summary Metrics Header Grid */}
      <AnalyticsOverview analytics={analytics} />

      {/* 2. Visual Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusDistributionChart data={analytics.by_status} total={analytics.total} />
        <PriorityDistributionChart data={analytics.by_priority} total={analytics.total} />
      </div>

      {/* 3. Department Volume Breakdown Chart */}
      <DepartmentDistributionChart data={analytics.by_department} total={analytics.total} />
    </div>
  );
}
