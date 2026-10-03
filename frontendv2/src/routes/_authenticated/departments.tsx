import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, ShieldCheck, Search, X } from "lucide-react";
import { useAnalytics, usePetitionList } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DepartmentCard,
  DepartmentOverview,
  DepartmentPetitionList,
  DepartmentSkeleton,
  DepartmentErrorState,
  DepartmentEmptyState,
} from "@/components/departments";

export const Route = createFileRoute("/_authenticated/departments")({
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { data: analytics, isLoading, error, refetch, isFetching } = useAnalytics();
  const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const departments = analytics?.by_department ?? [];
  const totalPetitions = analytics?.total ?? 0;

  // Determine active department selection (default to highest volume department)
  const activeCode = selectedDeptCode ?? departments[0]?.value ?? "";

  // Fetch petitions for currently selected department
  const { data: petitionData, isLoading: isPetitionsLoading } = usePetitionList(
    activeCode ? { page: 1, pageSize: 50, department: activeCode } : undefined
  );

  const maxCount = Math.max(1, ...departments.map((d) => d.count));

  // Client-side search filtering across available department codes
  const filteredDepartments = departments.filter((d) =>
    d.value.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  if (isLoading) {
    return <DepartmentSkeleton />;
  }

  if (error || !analytics) {
    return <DepartmentErrorState onRetry={() => refetch()} />;
  }

  if (departments.length === 0) {
    return <DepartmentEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Departments Directory
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
              <ShieldCheck className="size-3 text-slate-700" />
              {departments.length} Active Categories
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Overview of petition distribution and workload across government departments.
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

      {/* Top Overview Metrics */}
      <DepartmentOverview departments={departments} totalPetitions={totalPetitions} />

      {/* Main Layout: Left Column Department Cards, Right Column Selected Department Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department List & Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Department Categories
            </h2>
            <span className="text-[11px] font-medium text-slate-500">
              {filteredDepartments.length} Listed
            </span>
          </div>

          {/* Department Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter department codes..."
              className="h-9 w-full rounded-xl border-slate-200 bg-white pl-9 pr-8 text-xs placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Department Cards List */}
          <div className="space-y-2.5">
            {filteredDepartments.map((department) => (
              <DepartmentCard
                key={department.value}
                department={department}
                isSelected={activeCode === department.value}
                totalPetitions={totalPetitions}
                maxCount={maxCount}
                onSelect={(code) => setSelectedDeptCode(code)}
              />
            ))}

            {filteredDepartments.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                No department code matches "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Selected Department Petitions List (2 cols on desktop) */}
        <div className="lg:col-span-2">
          <DepartmentPetitionList
            departmentCode={activeCode}
            petitions={petitionData?.items ?? []}
            isLoading={isPetitionsLoading}
            totalCount={petitionData?.total ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
