import { Activity, Info, GitMerge, FileCheck, Clock, CheckCircle2 } from "lucide-react";
import type { Petition } from "@/types/petition";
import { StatusBadge } from "./badges";

interface PetitionActionStatusProps {
  petition: Petition;
}

export function PetitionActionStatus({ petition }: PetitionActionStatusProps) {
  const isAnalysed = petition.analysis !== null;
  
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 mt-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Activity className="size-4 text-slate-600" /> Action & Status Tracking
        </h2>
      </div>

      <div className="space-y-4">
        {/* Current Status */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-2">Current Status</h3>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">System State</span>
                <StatusBadge status={petition.status} className="text-xs px-2.5 py-0.5" />
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">AI Classification</span>
                {isAnalysed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="size-3" /> Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                    <Clock className="size-3" /> Pending
                  </span>
                )}
             </div>
          </div>
        </div>

        {/* Future Workflow */}
        <div className="pt-2">
          <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
            <Info className="size-3.5 text-slate-400" /> Future Workflow
          </h3>
          <div className="bg-white border border-dashed border-slate-200 rounded-lg p-3 text-xs text-slate-500">
             <p className="mb-2">The following historical event tracking will be supported once backend API integration is complete:</p>
             <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-400">
               <li>Detailed ingestion timestamp</li>
               <li>Forwarding event history and recipients</li>
               <li>Department response timestamps</li>
               <li>Action taken and resolution history</li>
             </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
