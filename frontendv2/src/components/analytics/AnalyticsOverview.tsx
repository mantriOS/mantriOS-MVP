import { Inbox, TrendingUp, Clock3, CheckCircle2, XCircle } from "lucide-react";
import type { AnalyticsStats } from "@/types/petition";
import { AnalyticsMetricCard } from "./AnalyticsMetricCard";

interface AnalyticsOverviewProps {
  analytics: AnalyticsStats;
}

export function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
  const metrics = [
    {
      label: "Total Petitions",
      value: analytics.total,
      subtext: "Total recorded grievances",
      icon: Inbox,
      iconBgClass: "bg-blue-50 border-blue-100",
      iconColorClass: "text-blue-600",
    },
    {
      label: "Resolution Rate",
      value: `${analytics.resolution_rate}%`,
      subtext: "Resolved vs total ratio",
      icon: TrendingUp,
      iconBgClass: "bg-indigo-50 border-indigo-100",
      iconColorClass: "text-indigo-600",
    },
    {
      label: "Open Cases",
      value: analytics.open,
      subtext: "Pending officer action",
      icon: Clock3,
      iconBgClass: "bg-amber-50 border-amber-100",
      iconColorClass: "text-amber-600",
    },
    {
      label: "Resolved",
      value: analytics.resolved,
      subtext: "Successfully closed",
      icon: CheckCircle2,
      iconBgClass: "bg-emerald-50 border-emerald-100",
      iconColorClass: "text-emerald-600",
    },
    {
      label: "Rejected",
      value: analytics.rejected,
      subtext: "Closed / non-actionable",
      icon: XCircle,
      iconBgClass: "bg-rose-50 border-rose-100",
      iconColorClass: "text-rose-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric) => (
        <AnalyticsMetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
