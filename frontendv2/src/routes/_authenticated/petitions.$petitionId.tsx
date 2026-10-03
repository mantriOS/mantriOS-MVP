import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { usePetition, useDashboard } from "@/services/api";
import {
  PetitionDetailHeader,
  PetitionContent,
  PetitionSummary,
  PetitionClassification,
  PetitionMetadata,
  PetitionDetailSkeleton,
  PetitionDetailError,
  OfficerReviewSection,
  ForwardPetitionDialog,
  PetitionCorrespondence,
  PetitionActionStatus,
} from "@/components/petitions";

export const Route = createFileRoute("/_authenticated/petitions/$petitionId")({
  component: PetitionDetailPage,
  notFoundComponent: () => <PetitionDetailError isNotFound={true} />,
});

function PetitionDetailPage() {
  const params = Route.useParams();
  const petitionId = Number(params.petitionId);

  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);

  const { data: petition, isLoading, error, refetch, isFetching } = usePetition(petitionId);
  const dashboard = useDashboard();
  const departments = dashboard.data?.by_department.map(d => d.value) ?? [];

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
        onForward={() => setIsForwardDialogOpen(true)}
      />

      {/* Responsive Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <PetitionContent petition={petition} />
          <PetitionSummary analysis={petition.analysis} />
          <OfficerReviewSection petition={petition} departments={departments} />
          <PetitionCorrespondence petition={petition} />
        </div>

        {/* Sidebar Classification & Metadata (1 col on desktop) */}
        <div className="space-y-6">
          <PetitionClassification petition={petition} />
          <PetitionActionStatus petition={petition} />
          <PetitionMetadata petition={petition} />
        </div>
      </div>
      
      <ForwardPetitionDialog 
        petition={petition} 
        isOpen={isForwardDialogOpen} 
        onClose={() => setIsForwardDialogOpen(false)} 
      />
    </div>
  );
}
