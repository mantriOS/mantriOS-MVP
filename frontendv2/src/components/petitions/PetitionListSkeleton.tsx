export function PetitionListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Desktop Table Skeleton */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-10 bg-slate-100/80 border-b border-slate-200" />
        <div className="divide-y divide-slate-100">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 gap-4">
              <div className="h-4 w-12 rounded bg-slate-200/70" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200/70" />
                <div className="h-3 w-1/2 rounded bg-slate-200/50" />
              </div>
              <div className="h-6 w-20 rounded-full bg-slate-200/60" />
              <div className="h-6 w-16 rounded-full bg-slate-200/60" />
              <div className="h-6 w-16 rounded-full bg-slate-200/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="md:hidden space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded bg-slate-200/70" />
              <div className="h-4 w-20 rounded bg-slate-200/70" />
            </div>
            <div className="h-4 w-full rounded bg-slate-200/70" />
            <div className="h-3 w-2/3 rounded bg-slate-200/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
