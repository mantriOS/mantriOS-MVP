export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-2/3 rounded-xl bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200/60" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-slate-200/60" />
        <div className="h-80 rounded-xl bg-slate-200/60" />
      </div>
      <div className="h-80 rounded-xl bg-slate-200/60" />
    </div>
  );
}
