import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PetitionErrorStateProps {
  onRetry: () => void;
}

export function PetitionErrorState({ onRetry }: PetitionErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs my-4">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
        <AlertCircle className="size-6" />
      </div>

      <h3 className="text-sm font-bold text-slate-900">Unable to load petitions</h3>

      <p className="mt-1 max-w-sm text-xs text-slate-500">
        There was a problem connecting to the petition service or fetching requested records.
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-4 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <RefreshCw className="mr-1.5 size-3.5" /> Retry Request
      </Button>
    </div>
  );
}
