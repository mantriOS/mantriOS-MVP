import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Petition } from "@/types/petition";
import { StatusBadge, PriorityBadge } from "./badges";

interface PetitionCardProps {
  petition: Petition;
}

export function PetitionCard({ petition }: PetitionCardProps) {
  return (
    <Link
      to="/petitions/$petitionId"
      params={{ petitionId: String(petition.id) }}
      className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs space-y-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500">#{petition.id}</span>
          {petition.analysis?.department_code && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
              {petition.analysis.department_code}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={petition.status} />
          {petition.analysis && <PriorityBadge priority={petition.analysis.priority} />}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
          {petition.subject}
        </h3>
        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
          {petition.analysis?.summary ?? petition.body}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
        {petition.analysis ? (
          <span className="flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            <Sparkles className="size-3 text-indigo-500" />
            {Math.round(petition.analysis.confidence * 100)}% AI Confidence
          </span>
        ) : (
          <span className="text-slate-400">Awaiting AI Triage</span>
        )}

        <span className="inline-flex items-center gap-1 font-bold text-slate-700 group-hover:text-slate-900">
          Open Petition <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

export function PetitionMobileList({ petitions }: { petitions: Petition[] }) {
  return (
    <div className="md:hidden space-y-3">
      {petitions.map((petition) => (
        <PetitionCard key={petition.id} petition={petition} />
      ))}
    </div>
  );
}
