import { FileText, User } from "lucide-react";
import type { Petition } from "@/types/petition";

interface PetitionContentProps {
  petition: Petition;
}

export function PetitionContent({ petition }: PetitionContentProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <FileText className="size-4 text-slate-600" /> Original Citizen Submission
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
          <User className="size-3 text-slate-400" /> Public Grievance
        </span>
      </div>

      <div>
        <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {petition.subject}
        </h1>
        <p className="mt-1 font-mono text-[11px] text-slate-400">
          Petition Reference: #{petition.id}
        </p>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Submission Text Body
        </h3>
        <div className="rounded-xl bg-slate-50/60 p-4 font-sans text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap border border-slate-100">
          {petition.body}
        </div>
      </div>
    </section>
  );
}
