import { Inbox, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PetitionEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function PetitionEmptyState({ hasFilters, onClearFilters }: PetitionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs my-4">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox className="size-6" />
      </div>

      <h3 className="text-sm font-bold text-slate-900">
        {hasFilters ? "No matching petitions found" : "No petitions in system"}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500">
        {hasFilters
          ? "There are no citizen petitions matching your current search parameters or active status filters."
          : "No citizen petitions have been ingested into the system yet."}
      </p>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-4 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <FilterX className="mr-1.5 size-3.5" /> Reset Filters & Search
        </Button>
      )}
    </div>
  );
}
