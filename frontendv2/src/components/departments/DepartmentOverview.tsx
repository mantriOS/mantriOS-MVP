import { Building2, Layers, TrendingUp } from "lucide-react";
import type { CountByValue } from "@/types/petition";

interface DepartmentOverviewProps {
  departments: CountByValue[];
  totalPetitions: number;
}

export function DepartmentOverview({ departments, totalPetitions }: DepartmentOverviewProps) {
  const activeCount = departments.length;
  const topDepartment = departments.length > 0 ? departments[0] : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Active Departments */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Departments
          </span>
          <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Building2 className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{activeCount}</p>
        <p className="text-[11px] font-medium text-slate-500">Categories receiving petitions</p>
      </div>

      {/* Classified Petitions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Classified Petitions
          </span>
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Layers className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">{totalPetitions}</p>
        <p className="text-[11px] font-medium text-slate-500">Total analyzed records</p>
      </div>

      {/* Highest Workload */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Highest Volume
          </span>
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <TrendingUp className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {topDepartment ? topDepartment.value : "N/A"}
        </p>
        <p className="text-[11px] font-medium text-slate-500">
          {topDepartment ? `${topDepartment.count} petitions assigned` : "No petitions"}
        </p>
      </div>
    </div>
  );
}
