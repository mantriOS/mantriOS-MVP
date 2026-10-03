import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Inbox } from "lucide-react";
import type { Petition } from "@/types/petition";
import { PriorityBadge, StatusBadge } from "@/components/petitions/badges";

interface RecentActivityProps {
  petitions: Petition[];
}

export function RecentActivity({ petitions }: RecentActivityProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Recent Petition Activity
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Latest incoming grievances processed into system
          </p>
        </div>
        <Link
          to="/inbox"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
        >
          View all inbox <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {petitions.length > 0 ? (
          petitions.map((petition) => (
            <PetitionRow key={petition.id} petition={petition} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <Inbox className="size-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">No petitions found</p>
            <p className="mt-0.5 text-[11px] text-slate-500">No recent activity logged in the system yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function PetitionRow({ petition }: { petition: Petition }) {
  return (
    <Link
      to="/petitions/$petitionId"
      params={{ petitionId: String(petition.id) }}
      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500">#{petition.id}</span>
          <span className="truncate text-xs font-semibold text-slate-900">{petition.subject}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
          <span>Dept: {petition.analysis?.department_code ?? "Unassigned"}</span>
          {petition.analysis?.summary && (
            <>
              <span>•</span>
              <span className="truncate max-w-xs text-slate-400">{petition.analysis.summary}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {petition.analysis && <PriorityBadge priority={petition.analysis.priority} />}
        <StatusBadge status={petition.status} />
      </div>
    </Link>
  );
}
