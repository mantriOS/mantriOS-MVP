import { cn } from "@/lib/utils";
import type { PetitionStatus, Priority } from "@/types/petition";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border border-amber-200/60",
  analysed: "bg-indigo-50 text-indigo-800 border border-indigo-200/60",
  forwarded: "bg-blue-50 text-blue-800 border border-blue-200/60",
  resolved: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
  rejected: "bg-rose-50 text-rose-800 border border-rose-200/60",
  analysis_failed: "bg-slate-100 text-slate-700 border border-slate-200",
};

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-rose-50 text-rose-700 border border-rose-200/60",
  MEDIUM: "bg-amber-50 text-amber-800 border border-amber-200/60",
  LOW: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
};

export function StatusBadge({ status, className }: { status: PetitionStatus | string; className?: string }) {
  const normalized = status ? status.toLowerCase() : "";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize shrink-0",
        STATUS_STYLES[normalized] ?? "bg-slate-100 text-slate-700 border border-slate-200",
        className,
      )}
    >
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority | string; className?: string }) {
  const normalized = priority ? priority.toUpperCase() : "";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase shrink-0",
        PRIORITY_STYLES[normalized] ?? "bg-slate-100 text-slate-700 border border-slate-200",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

export function formatWhen(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))} min ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)} hr ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatFull(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
