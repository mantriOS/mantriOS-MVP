import { Database } from "lucide-react";
import type { Petition } from "@/types/petition";

interface PetitionMetadataProps {
  petition: Petition;
}

export function PetitionMetadata({ petition }: PetitionMetadataProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Database className="size-4 text-slate-600" /> Record Metadata
        </h2>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1 border-b border-slate-50">
          <span className="text-slate-500 font-medium">Petition ID</span>
          <span className="font-mono font-bold text-slate-900">#{petition.id}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-slate-500 font-medium">Status</span>
          <span className="font-mono text-slate-800 font-bold">{petition.status}</span>
        </div>
      </div>
    </section>
  );
}
