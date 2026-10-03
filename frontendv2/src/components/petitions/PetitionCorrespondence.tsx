import { MessageSquare, Inbox } from "lucide-react";
import type { Petition } from "@/types/petition";

interface PetitionCorrespondenceProps {
  petition: Petition;
}

export function PetitionCorrespondence({ petition }: PetitionCorrespondenceProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <MessageSquare className="size-4 text-slate-600" /> Communication & Correspondence
        </h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          History
        </span>
      </div>

      <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
          <Inbox className="size-5 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">No correspondence available yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Replies, department responses, and forwarded messages will appear here once connected to the backend.
          </p>
        </div>
      </div>
    </section>
  );
}
