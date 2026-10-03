import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Petition } from "@/types/petition";
import { StatusBadge, PriorityBadge } from "./badges";

interface PetitionTableProps {
  petitions: Petition[];
}

export function PetitionTable({ petitions }: PetitionTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 border-collapse">
        <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th scope="col" className="py-3 px-4 w-20">ID</th>
            <th scope="col" className="py-3 px-4">Subject & Content Summary</th>
            <th scope="col" className="py-3 px-4 w-32">Department</th>
            <th scope="col" className="py-3 px-4 w-28">Priority</th>
            <th scope="col" className="py-3 px-4 w-28">Status</th>
            <th scope="col" className="py-3 px-4 w-24">Confidence</th>
            <th scope="col" className="py-3 px-4 w-20 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {petitions.map((petition) => (
            <tr
              key={petition.id}
              className="group transition-colors hover:bg-slate-50/80 cursor-pointer"
            >
              <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                #{petition.id}
              </td>
              <td className="py-3.5 px-4">
                <Link
                  to="/petitions/$petitionId"
                  params={{ petitionId: String(petition.id) }}
                  className="block group-hover:text-primary transition-colors"
                >
                  <p className="font-semibold text-slate-900 text-xs line-clamp-1">
                    {petition.subject}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                    {petition.analysis?.summary ?? petition.body}
                  </p>
                </Link>
              </td>
              <td className="py-3.5 px-4">
                {petition.analysis?.department_code ? (
                  <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                    {petition.analysis.department_code}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">Unassigned</span>
                )}
              </td>
              <td className="py-3.5 px-4">
                {petition.analysis ? (
                  <PriorityBadge priority={petition.analysis.priority} />
                ) : (
                  <span className="text-slate-400 text-[11px]">—</span>
                )}
              </td>
              <td className="py-3.5 px-4">
                <StatusBadge status={petition.status} />
              </td>
              <td className="py-3.5 px-4">
                {petition.analysis ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    <Sparkles className="size-3 text-indigo-500" />
                    {Math.round(petition.analysis.confidence * 100)}%
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right">
                <Link
                  to="/petitions/$petitionId"
                  params={{ petitionId: String(petition.id) }}
                  className="inline-flex items-center gap-1 font-bold text-[11px] text-slate-700 hover:text-slate-900 hover:underline"
                >
                  View <ArrowUpRight className="size-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
