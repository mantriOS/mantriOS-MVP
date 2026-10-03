import { Sparkles, Brain, AlertCircle } from "lucide-react";
import type { PetitionAnalysis } from "@/types/petition";

interface PetitionSummaryProps {
  analysis: PetitionAnalysis | null;
}

export function PetitionSummary({ analysis }: PetitionSummaryProps) {
  if (!analysis) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5">
          <Sparkles className="size-4 text-slate-400" />
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            AI Automated Summary
          </h2>
        </div>
        <div className="flex items-center gap-3 py-6 text-slate-500">
          <AlertCircle className="size-5 shrink-0 text-slate-400" />
          <p className="text-xs">
            AI summary is not available for this petition yet. Queued for automated classification.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-100/80 pb-3.5">
        <h2 className="flex items-center gap-2 text-xs font-bold text-indigo-950 uppercase tracking-wider">
          <Sparkles className="size-4 text-indigo-600" /> AI Executive Summary
        </h2>
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200/60">
          <Brain className="size-3 text-indigo-600" /> Gemini Triage
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
            Grievance Summary
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-indigo-100">
            {analysis.summary}
          </p>
        </div>

        {analysis.reason && (
          <div>
            <h3 className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
              AI Reasoning & Routing Rationale
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-white/60 p-3 rounded-xl border border-indigo-100/60">
              {analysis.reason}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
