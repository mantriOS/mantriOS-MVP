import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DepartmentErrorStateProps {
  onRetry: () => void;
}

export function DepartmentErrorState({ onRetry }: DepartmentErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs my-8">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
        <AlertCircle className="size-6" />
      </div>

      <h2 className="text-base font-bold text-slate-900">Unable to load department information</h2>

      <p className="mt-1 max-w-md text-xs text-slate-500">
        We encountered a problem fetching department workload data from the server.
      </p>

      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="mt-5 rounded-xl border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50"
      >
        <RefreshCw className="mr-2 size-3.5" /> Retry Connection
      </Button>
    </div>
  );
}
