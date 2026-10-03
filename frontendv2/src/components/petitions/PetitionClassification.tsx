import { Building2, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import type { Petition } from "@/types/petition";
import { StatusBadge, PriorityBadge } from "./badges";

interface PetitionClassificationProps {
  petition: Petition;
}

export function PetitionClassification({ petition }: PetitionClassificationProps) {
  const analysis = petition.analysis;
  const confidencePercent = analysis ? Math.round(analysis.confidence * 100) : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Building2 className="size-4 text-slate-600" /> Triage & Classification
        </h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Metadata
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Department Code */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            AI Suggested Department
          </span>
          {analysis?.department_code ? (
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs border border-slate-200">
                {analysis.department_code}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Unassigned / Pending</span>
          )}
        </div>

        {/* Priority Status */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            AI Suggested Priority
          </span>
          {analysis?.priority ? (
            <PriorityBadge priority={analysis.priority} className="text-xs px-3 py-1" />
          ) : (
            <span className="text-xs text-slate-400 italic">Standard Priority</span>
          )}
        </div>

        {/* Processing Status */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Current Status
          </span>
          <StatusBadge status={petition.status} className="text-xs px-3 py-1" />
        </div>

        {/* AI Confidence Bar */}
        {confidencePercent !== null && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-indigo-950">
                <Sparkles className="size-3.5 text-indigo-600" /> AI Confidence
              </span>
              <span className="font-bold text-indigo-700">{confidencePercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
