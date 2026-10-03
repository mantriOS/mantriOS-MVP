import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Inbox, Sparkles, Building2 } from "lucide-react";
import type { Petition } from "@/types/petition";
import { PriorityBadge, StatusBadge } from "@/components/petitions/badges";

interface DepartmentPetitionListProps {
  departmentCode: string;
  petitions: Petition[];
  isLoading: boolean;
  totalCount: number;
}

export function DepartmentPetitionList({
  departmentCode,
  petitions,
  isLoading,
  totalCount,
}: DepartmentPetitionListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Department Petitions
            </h2>
            <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
              {departmentCode}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {totalCount} {totalCount === 1 ? "petition" : "petitions"} classified under this category
          </p>
        </div>

        <Link
          to="/inbox"
          search={{ department: departmentCode, status: "all", priority: "all", q: "", page: 1 }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
        >
          View all in Inbox <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2 animate-pulse">
            <div className="h-4 w-3/4 mx-auto rounded bg-slate-200/70" />
            <div className="h-4 w-1/2 mx-auto rounded bg-slate-200/50" />
            <p className="mt-2">Fetching department petitions...</p>
          </div>
        ) : petitions.length > 0 ? (
          petitions.map((petition) => (
            <Link
              key={petition.id}
              to="/petitions/$petitionId"
              params={{ petitionId: String(petition.id) }}
              className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">#{petition.id}</span>
                  <span className="truncate text-xs font-semibold text-slate-900">{petition.subject}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                  {petition.analysis?.summary ?? petition.body}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {petition.analysis && <PriorityBadge priority={petition.analysis.priority} />}
                <StatusBadge status={petition.status} />
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <Inbox className="size-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">No petitions found</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              No petitions are currently assigned to department code "{departmentCode}".
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
