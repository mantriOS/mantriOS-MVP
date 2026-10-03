import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, ShieldCheck, Forward } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Petition } from "@/types/petition";
import { StatusBadge, PriorityBadge } from "./badges";

interface PetitionDetailHeaderProps {
  petition: Petition;
  isFetching?: boolean;
  onRefresh: () => void;
  onForward: () => void;
}

export function PetitionDetailHeader({
  petition,
  isFetching,
  onRefresh,
  onForward,
}: PetitionDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Link to="/inbox">
            <ArrowLeft className="mr-1.5 size-3.5" /> Back to Inbox
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            #{petition.id}
          </span>
          <StatusBadge status={petition.status} />
          {petition.analysis && (
            <PriorityBadge priority={petition.analysis.priority} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onForward}
          className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white px-4"
        >
          <Forward className="mr-1.5 size-3.5" /> Forward
        </Button>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
          <ShieldCheck className="size-3.5 text-slate-700" />
          Official Record
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 rounded-xl border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
          title="Refresh Petition Details"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
