import { createFileRoute } from "@tanstack/react-router";
import { usePetition } from "@/services/api";
import {
  PetitionDetailHeader,
  PetitionContent,
  PetitionSummary,
  PetitionClassification,
  PetitionMetadata,
  PetitionDetailSkeleton,
  PetitionDetailError,
} from "@/components/petitions";

export const Route = createFileRoute("/_authenticated/petitions/$petitionId")({
  component: PetitionDetailPage,
  notFoundComponent: () => <PetitionDetailError isNotFound={true} />,
});

function PetitionDetailPage() {
  const params = Route.useParams();
  const petitionId = Number(params.petitionId);

  const { data: petition, isLoading, error, refetch, isFetching } = usePetition(petitionId);

  if (isLoading) {
    return <PetitionDetailSkeleton />;
  }

  const isNotFound = Boolean(error && "status" in error && error.status === 404);

  if (isNotFound || error || !petition) {
    return <PetitionDetailError isNotFound={isNotFound} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Detail Header */}
      <PetitionDetailHeader
        petition={petition}
        isFetching={isFetching}
        onRefresh={() => refetch()}
      />

      {/* Responsive Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <PetitionContent petition={petition} />
          <PetitionSummary analysis={petition.analysis} />
        </div>

        {/* Sidebar Classification & Metadata (1 col on desktop) */}
        <div className="space-y-6">
          <PetitionClassification petition={petition} />
          <PetitionMetadata petition={petition} />
        </div>
      </div>
    </div>
  );
}
