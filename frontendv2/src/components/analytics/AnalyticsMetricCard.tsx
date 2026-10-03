import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsMetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
}

export function AnalyticsMetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconBgClass = "bg-slate-100 border-slate-200",
  iconColorClass = "text-slate-700",
}: AnalyticsMetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span className={cn("flex size-8 items-center justify-center rounded-lg border", iconBgClass, iconColorClass)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subtext && (
        <p className="mt-0.5 text-[11px] font-medium text-slate-500">{subtext}</p>
      )}
    </div>
  );
}
