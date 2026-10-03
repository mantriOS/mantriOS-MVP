import { Building2, Inbox } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { CountByValue } from "@/types/petition";

interface DepartmentCardProps {
  department: CountByValue;
  isSelected: boolean;
  totalPetitions: number;
  maxCount: number;
  onSelect: (deptCode: string) => void;
}

export function DepartmentCard({
  department,
  isSelected,
  totalPetitions,
  maxCount,
  onSelect,
}: DepartmentCardProps) {
  const percentage = totalPetitions > 0 ? Math.round((department.count / totalPetitions) * 100) : 0;
  const barWidth = maxCount > 0 ? Math.round((department.count / maxCount) * 100) : 0;

  return (
    <div
      onClick={() => onSelect(department.value)}
      className={cn(
        "group relative cursor-pointer rounded-xl border p-4 transition-all duration-200",
        isSelected
          ? "border-slate-900 bg-white shadow-xs ring-1 ring-slate-900"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-xl transition-colors",
              isSelected
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
            )}
          >
            <Building2 className="size-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              {department.value}
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              {department.count} {department.count === 1 ? "petition" : "petitions"} ({percentage}% of total)
            </p>
          </div>
        </div>

        <Link
          to="/inbox"
          search={{ department: department.value, status: "all", priority: "all", q: "", page: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title={`Filter Inbox by ${department.value}`}
        >
          <Inbox className="size-3" /> Filter Inbox
        </Link>
      </div>

      {/* Workload Progress Bar */}
      <div className="mt-3.5 space-y-1">
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isSelected ? "bg-slate-900" : "bg-slate-500"
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
