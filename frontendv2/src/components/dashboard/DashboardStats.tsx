import { Inbox, Clock3, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DashboardStats as DashboardStatsType, AnalyticsStats } from "@/types/petition";
import { StatsCard } from "./StatsCard";

interface DashboardStatsProps {
  dashboard: DashboardStatsType;
  analytics?: AnalyticsStats;
}

export function DashboardStats({ dashboard, analytics }: DashboardStatsProps) {
  const resolvedCount = analytics ? analytics.resolved : Math.max(0, dashboard.total - dashboard.pending);
  const resolutionRate = analytics && analytics.total > 0 ? `${analytics.resolution_rate}% resolution rate` : undefined;

  const stats = [
    {
      label: "Total Petitions",
      value: dashboard.total,
      icon: Inbox,
      subtext: "All incoming grievances",
      iconBgClass: "bg-blue-50 border border-blue-100",
      iconColorClass: "text-blue-600",
    },
    {
      label: "Pending Action",
      value: dashboard.pending,
      icon: Clock3,
      subtext: "Awaiting resolution",
      iconBgClass: "bg-amber-50 border border-amber-100",
      iconColorClass: "text-amber-600",
    },
    {
      label: "AI Triage Analysed",
      value: dashboard.analysed,
      icon: Sparkles,
      subtext: "Processed via Gemini",
      iconBgClass: "bg-indigo-50 border border-indigo-100",
      iconColorClass: "text-indigo-600",
    },
    {
      label: "High Priority",
      value: dashboard.high_priority,
      icon: AlertTriangle,
      subtext: "Requires urgent focus",
      iconBgClass: "bg-rose-50 border border-rose-100",
      iconColorClass: "text-rose-600",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      subtext: resolutionRate ?? "Closed petitions",
      iconBgClass: "bg-emerald-50 border border-emerald-100",
      iconColorClass: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatsCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
