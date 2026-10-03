import { BarChart3 } from "lucide-react";

export function AnalyticsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs my-8">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <BarChart3 className="size-6" />
      </div>

      <h2 className="text-base font-bold text-slate-900">No analytics data available</h2>

      <p className="mt-1 max-w-md text-xs text-slate-500">
        No operational grievance telemetry has been compiled by the system yet.
      </p>
    </div>
  );
}
