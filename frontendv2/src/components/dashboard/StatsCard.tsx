import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  subtext?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  subtext,
  iconBgClass = "bg-slate-100",
  iconColorClass = "text-slate-700",
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", iconBgClass, iconColorClass)}>
          <Icon className="size-4 sm:size-5" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value.toLocaleString()}
        </span>
      </div>
      {subtext && (
        <p className="mt-1 text-[11px] font-medium text-slate-500">{subtext}</p>
      )}
    </div>
  );
}
