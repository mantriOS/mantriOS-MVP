import { cn } from "@/lib/utils";
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  analysed: "bg-info-soft text-accent-foreground",
  forwarded: "bg-accent text-accent-foreground",
  resolved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-destructive",
};

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-danger-soft text-destructive",
  MEDIUM: "bg-warning-soft text-[oklch(0.45_0.12_70)]",
  LOW: "bg-success-soft text-success",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status.toLowerCase()] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        PRIORITY_STYLES[priority.toUpperCase()] ?? "bg-muted text-muted-foreground",
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
