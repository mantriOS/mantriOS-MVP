import { Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight, ShieldAlert } from "lucide-react";
import type { Petition } from "@/types/petition";
import { StatusBadge } from "@/components/petitions/badges";

interface UrgentAttentionProps {
  urgent: Petition[];
}

export function UrgentAttention({ urgent }: UrgentAttentionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <AlertTriangle className="size-4 text-rose-600" /> Urgent Attention Required
        </h2>
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/60">
          {urgent.length} High Priority
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {urgent.length > 0 ? (
          urgent.map((petition) => (
            <Link
              key={petition.id}
              to="/petitions/$petitionId"
              params={{ petitionId: String(petition.id) }}
              className="group flex flex-col gap-2 rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 transition-colors hover:bg-rose-50/90 hover:border-rose-200"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 line-clamp-2 group-hover:text-rose-950">
                  {petition.subject}
                </span>
                <ChevronRight className="size-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono text-slate-600">#{petition.id}</span>
                <div className="flex items-center gap-1.5">
                  {petition.analysis?.department_code && (
                    <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">
                      {petition.analysis.department_code}
                    </span>
                  )}
                  <StatusBadge status={petition.status} />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShieldAlert className="size-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">All clear</p>
            <p className="mt-0.5 text-[11px] text-slate-500">No urgent high-priority petitions pending review.</p>
          </div>
        )}
      </div>
    </section>
  );
}
