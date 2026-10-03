export function DepartmentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-2/3 rounded-xl bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200/60" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200/60" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="h-72 rounded-xl bg-slate-200/60" />
        </div>
      </div>
    </div>
  );
}
