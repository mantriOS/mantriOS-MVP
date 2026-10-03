export function PetitionDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-full max-w-md rounded-xl bg-slate-200/70" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-72 rounded-xl bg-slate-200/60" />
          <div className="h-48 rounded-xl bg-slate-200/60" />
        </div>
        <div className="space-y-6">
          <div className="h-60 rounded-xl bg-slate-200/60" />
          <div className="h-48 rounded-xl bg-slate-200/60" />
        </div>
      </div>
    </div>
  );
}
