import { Building2 } from "lucide-react";
import type { CountByValue } from "@/types/petition";

interface DepartmentLoadProps {
  byDepartment: CountByValue[];
}

export function DepartmentLoad({ byDepartment }: DepartmentLoadProps) {
  const maxLoad = Math.max(1, ...byDepartment.map((d) => d.count));
  const totalItems = byDepartment.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Building2 className="size-4 text-slate-600" /> Department Workload
        </h2>
        <span className="text-[11px] font-medium text-slate-500">
          {byDepartment.length} Active Depts
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {byDepartment.length > 0 ? (
          byDepartment.map((department) => {
            const percentage = totalItems > 0 ? Math.round((department.count / totalItems) * 100) : 0;
            return (
              <div key={department.value} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="font-semibold text-slate-800">{department.value}</span>
                  <span className="text-slate-500">
                    {department.count} {department.count === 1 ? "petition" : "petitions"} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-300"
                    style={{ width: `${(department.count / maxLoad) * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-6 text-center text-xs text-slate-500">
            No department breakdown data available yet.
          </p>
        )}
      </div>
    </section>
  );
}
