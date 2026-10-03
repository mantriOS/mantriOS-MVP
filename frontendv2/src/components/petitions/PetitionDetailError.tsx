import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PetitionDetailErrorProps {
  isNotFound?: boolean;
  onRetry?: () => void;
}

export function PetitionDetailError({ isNotFound, onRetry }: PetitionDetailErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs my-8">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
        <AlertCircle className="size-6" />
      </div>

      <h2 className="text-base font-bold text-slate-900">
        {isNotFound ? "Petition Not Found" : "Unable to load petition details"}
      </h2>

      <p className="mt-1 max-w-md text-xs text-slate-500">
        {isNotFound
          ? "The requested petition ID does not exist in the system or has been deleted."
          : "We encountered a network problem connecting to the petition service."}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Link to="/inbox">
            <ArrowLeft className="mr-1.5 size-3.5" /> Return to Inbox
          </Link>
        </Button>

        {!isNotFound && onRetry && (
          <Button
            size="sm"
            onClick={onRetry}
            className="rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw className="mr-1.5 size-3.5" /> Retry Request
          </Button>
        )}
      </div>
    </div>
  );
}
