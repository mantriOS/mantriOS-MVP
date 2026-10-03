import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Inbox as InboxIcon, ShieldCheck } from "lucide-react";
import { useDashboard, usePetitionList } from "@/services/api";
import {
  PetitionFilters,
  PetitionTable,
  PetitionMobileList,
  PetitionPagination,
  PetitionEmptyState,
  PetitionListSkeleton,
  PetitionErrorState,
} from "@/components/petitions";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "all").default("all"),
  priority: fallback(z.string(), "all").default("all"),
  department: fallback(z.string(), "all").default("all"),
  page: fallback(z.coerce.number(), 1).default(1),
});

export const Route = createFileRoute("/_authenticated/inbox")({
  validateSearch: zodValidator(searchSchema),
  component: InboxPage,
});

function InboxPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/inbox" });

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({
      search: (previous: typeof search) => ({
        ...previous,
        ...patch,
        page: patch.page !== undefined ? patch.page : 1,
      }),
    });

  const handleClearFilters = () => {
    navigate({
      search: {
        q: "",
        status: "all",
        priority: "all",
        department: "all",
        page: 1,
      },
    });
  };

  const { data, isLoading, error, refetch, isFetching } = usePetitionList({
    page: search.page,
    pageSize: 20,
    search: search.q.trim() || undefined,
    status: search.status === "all" ? undefined : search.status,
    priority: search.priority === "all" ? undefined : search.priority,
    department: search.department === "all" ? undefined : search.department,
  });

  const dashboard = useDashboard();
  const departments = dashboard.data?.by_department ?? [];

  const hasActiveFilters = Boolean(
    search.q.trim() || search.status !== "all" || search.priority !== "all" || search.department !== "all"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Petition Inbox
            </h1>
            {data && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
                <InboxIcon className="size-3 text-slate-600" />
                {data.total} {data.total === 1 ? "Petition" : "Petitions"}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Central operational workspace for searching, filtering, triaging, and resolving citizen petitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <ShieldCheck className="size-3.5 text-slate-700" />
            Live Processing
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <PetitionFilters
        q={search.q}
        status={search.status}
        priority={search.priority}
        department={search.department}
        departments={departments}
        isFetching={isFetching}
        onSearchChange={(q) => setSearch({ q })}
        onStatusChange={(status) => setSearch({ status })}
        onPriorityChange={(priority) => setSearch({ priority })}
        onDepartmentChange={(department) => setSearch({ department })}
        onClearFilters={handleClearFilters}
        onRefresh={() => refetch()}
      />

      {/* Main List Container */}
      {isLoading ? (
        <PetitionListSkeleton />
      ) : error ? (
        <PetitionErrorState onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <PetitionEmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          {/* Desktop Table View */}
          <PetitionTable petitions={data.items} />

          {/* Mobile Card List View */}
          <div className="p-3 md:hidden">
            <PetitionMobileList petitions={data.items} />
          </div>

          {/* Pagination Footer Controls */}
          <PetitionPagination
            page={data.page}
            totalPages={data.total_pages}
            totalItems={data.total}
            pageSize={data.page_size}
            onPageChange={(newPage) => setSearch({ page: newPage })}
          />
        </div>
      )}
    </div>
  );
}
