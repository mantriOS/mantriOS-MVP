import { useState } from "react";
import { UserCheck, Building2, AlertTriangle, Save, CheckCircle2 } from "lucide-react";
import type { Petition } from "@/types/petition";

interface OfficerReviewSectionProps {
  petition: Petition;
  departments: string[];
}

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

export function OfficerReviewSection({ petition, departments }: OfficerReviewSectionProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(petition.analysis?.department_code || "");
  const [selectedPriority, setSelectedPriority] = useState<string>(petition.analysis?.priority || "MEDIUM");

  const aiDepartment = petition.analysis?.department_code;
  const aiPriority = petition.analysis?.priority;

  const isDepartmentOverridden = aiDepartment && selectedDepartment && selectedDepartment !== aiDepartment;
  const isPriorityOverridden = aiPriority && selectedPriority && selectedPriority !== aiPriority;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5 mt-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <UserCheck className="size-4 text-slate-600" /> Human Review / Officer Decision
        </h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Final Decision
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Selection */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-slate-400" /> Officer Assigned Department
            </span>
            {isDepartmentOverridden && (
              <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="size-2.5" /> Override
              </span>
            )}
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
          >
            <option value="" disabled>Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
            <span>AI Suggested: <strong>{aiDepartment || "None"}</strong></span>
            {!isDepartmentOverridden && aiDepartment && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="size-3" /> Matches AI
              </span>
            )}
          </div>
        </div>

        {/* Priority Selection */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-slate-400" /> Officer Priority Assessment
            </span>
            {isPriorityOverridden && (
              <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="size-2.5" /> Override
              </span>
            )}
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
            <span>AI Suggested: <strong>{aiPriority || "None"}</strong></span>
            {!isPriorityOverridden && aiPriority && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="size-3" /> Matches AI
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          disabled
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white opacity-60 cursor-not-allowed transition-all"
        >
          <Save className="size-3.5" /> Save Assignment (Coming soon)
        </button>
      </div>
    </section>
  );
}
