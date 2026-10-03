import { PieChart, ShieldCheck } from "lucide-react";
import type { AnalyticsStats } from "@/types/petition";

interface StatusOverviewProps {
  analytics?: AnalyticsStats;
}

export function StatusOverview({ analytics }: StatusOverviewProps) {
  if (!analytics) return null;

  const { by_status, by_priority } = analytics;
  const total = analytics.total || 1;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <PieChart className="size-4 text-slate-600" /> Status & Priority Distribution
        </h2>
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <ShieldCheck className="size-3" /> Live Telemetry
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Status Distribution */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700">By Status</h3>
          {by_status && by_status.length > 0 ? (
            <div className="space-y-2">
              {by_status.map((item) => {
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.value} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 capitalize">{item.value.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-slate-900">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No status breakdown data</p>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700">By AI Priority</h3>
          {by_priority && by_priority.length > 0 ? (
            <div className="space-y-2">
              {by_priority.map((item) => {
                const pct = Math.round((item.count / total) * 100);
                const colorClass =
                  item.value.toUpperCase() === "HIGH"
                    ? "bg-rose-500"
                    : item.value.toUpperCase() === "MEDIUM"
                    ? "bg-amber-500"
                    : "bg-emerald-500";

                return (
                  <div key={item.value} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 uppercase">{item.value}</span>
                      <span className="font-semibold text-slate-900">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No priority breakdown data</p>
          )}
        </div>
      </div>
    </section>
  );
}
