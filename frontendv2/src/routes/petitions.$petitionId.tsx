import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import {
  ArrowLeft,
  Brain,
  CalendarClock,
  CheckCircle2,
  Mail,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

import { usePetition } from "@/lib/api";

import { PriorityBadge, StatusBadge } from "@/components/petition/badges";

import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/petitions/$petitionId")({
  component: PetitionDetail,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <p className="text-lg font-medium">Petition not found</p>
      <Link
        to="/"
        className="mt-2 text-primary underline"
      >
        Back to inbox
      </Link>
    </div>
  ),
});

function PetitionDetail() {
  const petitionId = Number(Route.useParams().petitionId);

  const {
    data: petition,
    isLoading,
    error,
    refetch,
    isFetching,
  } = usePetition(petitionId);

  if (isLoading) {
    return <State label="Loading petition..." />;
  }

  if (error && "status" in error && error.status === 404) {
    throw notFound();
  }

  if (error || !petition) {
    return (
      <State
        label="Unable to load petition."
        retry={() => refetch()}
      />
    );
  }

  const confidence = petition.analysis
    ? Math.round(petition.analysis.confidence * 100)
    : 0;

  const department = petition.analysis?.department;
  const forwarding = petition.analysis?.forwarding;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────
          TOP BAR
      ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Inbox
        </Link>

        <span className="text-sm font-medium text-muted-foreground">
          #{petition.id}
        </span>

        {petition.analysis && (
          <>
            <StatusBadge status={petition.status} />
            <PriorityBadge priority={petition.analysis.priority} />
          </>
        )}

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto rounded-full border border-border bg-card p-2 transition hover:bg-muted disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw
            className={`size-4 ${
              isFetching ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* ─────────────────────────────────────────────
          PETITION + AI ANALYSIS
      ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Petition */}
        <article className="rounded-2xl border border-border bg-card p-7 shadow-e1">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {petition.subject}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-4" />
              Petition #{petition.id}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="whitespace-pre-wrap text-[16px] leading-8 text-foreground/85">
              {petition.body}
            </div>
          </div>
        </article>

        {/* AI Analysis */}
        <aside className="rounded-2xl border border-blue-100 bg-blue-50/80 p-7 shadow-e1">
          <div className="mb-6 flex items-center gap-2">
            <Brain className="size-5 text-blue-600" />

            <h2 className="font-semibold text-blue-900">
              AI analysis
            </h2>
          </div>

          {petition.analysis ? (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Summary
                </p>

                <p className="text-sm leading-6 text-foreground/85">
                  {petition.analysis.summary}
                </p>
              </div>

              {/* Department + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Department
                  </p>

                  <p className="font-semibold">
                    {department?.code ??
                      petition.analysis.department_code}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Priority
                  </p>

                  <PriorityBadge
                    priority={petition.analysis.priority}
                  />
                </div>
              </div>

              {/* Confidence */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Confidence
                  </p>

                  <span className="text-sm font-semibold">
                    {confidence}%
                  </span>
                </div>

                <Progress value={confidence} />
              </div>

              {/* Reasoning */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reasoning
                </p>

                <p className="text-sm leading-6 text-foreground/85">
                  {petition.analysis.reason}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              Queued for analysis. Classification will appear once
              processing finishes.
            </div>
          )}
        </aside>
      </div>

      {/* ─────────────────────────────────────────────
          FORWARD PETITION
      ───────────────────────────────────────────── */}
      {petition.analysis && forwarding && (
        <section className="rounded-2xl border border-border bg-card shadow-e1">
          {/* Header */}
          <div className="border-b border-border px-7 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <Send className="size-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Forward Petition
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review the destination and generated communication
                  before forwarding this petition.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-7">
            {/* Recipient */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Forward to
              </p>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 text-muted-foreground" />

                  <div>
                    <p className="font-semibold">
                      {department?.name ??
                        petition.analysis.department_code}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {department?.email ??
                        "Department email unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Subject
              </p>

              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                {forwarding.subject}
              </div>
            </div>

            {/* Email body */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Official communication
                </p>

                <span className="text-xs text-muted-foreground">
                  AI-generated draft
                </span>
              </div>

              <div className="rounded-xl border border-border bg-background p-6">
                <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">
                  {forwarding.body}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-end border-t border-border pt-6">
              <button
                type="button"
                disabled={!department?.email}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  // TODO: Connect this to the forwarding API.
                  console.log("Forward petition", {
                    petitionId: petition.id,
                    recipient: department?.email,
                    subject: forwarding.subject,
                    body: forwarding.body,
                  });
                }}
              >
                <Send className="size-4" />
                Forward Petition
              </button>
            </div>
          </div>
        </section>
      )}

      {/* No forwarding data */}
      {petition.analysis && !forwarding && (
        <section className="rounded-2xl border border-dashed border-border bg-card p-7">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="size-5" />
            Forwarding information is not available for this petition.
          </div>
        </section>
      )}
    </div>
  );
}

function State({
  label,
  retry,
}: {
  label: string;
  retry?: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-sm text-muted-foreground">{label}</p>

      {retry && (
        <button
          onClick={() => retry()}
          className="mt-3 text-sm text-primary underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}