import { Search, X, RefreshCw, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CountByValue } from "@/types/petition";

interface PetitionFiltersProps {
  q: string;
  status: string;
  priority: string;
  department: string;
  departments: CountByValue[];
  isFetching?: boolean;
  onSearchChange: (q: string) => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onDepartmentChange: (department: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export function PetitionFilters({
  q,
  status,
  priority,
  department,
  departments,
  isFetching,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onDepartmentChange,
  onClearFilters,
  onRefresh,
}: PetitionFiltersProps) {
  const hasActiveFilters = Boolean(
    q.trim() || status !== "all" || priority !== "all" || department !== "all"
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search petitions by subject, ID, or body text..."
            className="h-9 w-full rounded-xl border-slate-200 bg-slate-50/70 pl-9 pr-8 text-xs placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary"
          />
          {q && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Clear search text"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-[140px] sm:w-[150px] rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="analysed">Analysed</SelectItem>
            <SelectItem value="forwarded">Forwarded</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priority} onValueChange={onPriorityChange}>
          <SelectTrigger className="h-9 w-[130px] sm:w-[140px] rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="HIGH">High Priority</SelectItem>
            <SelectItem value="MEDIUM">Medium Priority</SelectItem>
            <SelectItem value="LOW">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Department Filter */}
        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger className="h-9 w-[150px] sm:w-[170px] rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.value} ({dept.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 rounded-xl px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <FilterX className="mr-1.5 size-3.5" /> Clear Filters
          </Button>
        )}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 rounded-xl border-slate-200 text-xs font-medium text-slate-700 ml-auto hover:bg-slate-50"
          title="Refresh Petition List"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
