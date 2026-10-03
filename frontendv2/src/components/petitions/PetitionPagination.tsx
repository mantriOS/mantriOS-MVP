import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PetitionPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export function PetitionPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PetitionPaginationProps) {
  if (totalPages <= 1 && totalItems <= pageSize) {
    return (
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500 rounded-b-xl">
        <span>Showing all <strong>{totalItems}</strong> petitions</span>
        <span>Page 1 of 1</span>
      </div>
    );
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3.5 text-xs text-slate-600 rounded-b-xl">
      <div>
        Showing <strong className="text-slate-900">{startItem}</strong> to{" "}
        <strong className="text-slate-900">{endItem}</strong> of{" "}
        <strong className="text-slate-900">{totalItems}</strong> petitions
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 size-3.5" /> Previous
        </Button>

        <span className="px-2 font-semibold text-slate-800">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-40"
        >
          Next <ChevronRight className="ml-1 size-3.5" />
        </Button>
      </div>
    </div>
  );
}
