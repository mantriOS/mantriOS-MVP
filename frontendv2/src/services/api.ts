import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api";
import type {
  AnalyticsStats,
  DashboardStats,
  Petition,
  PetitionListParams,
  PetitionListResponse,
  ProcessEmailRequest,
  ProcessEmailResponse,
} from "@/types/petition";

export { ApiError } from "@/lib/api";

// ── Service API Functions ──────────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardStats> {
  return apiClient<DashboardStats>("/api/v1/dashboard");
}

export async function fetchAnalytics(): Promise<AnalyticsStats> {
  return apiClient<AnalyticsStats>("/api/v1/analytics");
}

export async function fetchPetition(id: number): Promise<Petition> {
  return apiClient<Petition>(`/api/v1/petitions/${id}`);
}

export async function fetchPetitionList(params?: PetitionListParams): Promise<PetitionListResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    if (params.page !== undefined && params.page !== null) {
      searchParams.append("page", String(params.page));
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      searchParams.append("page_size", String(params.pageSize));
    }
    if (params.search) {
      searchParams.append("search", params.search.trim());
    }
    if (params.status && params.status !== "all") {
      searchParams.append("status", params.status.trim());
    }
    if (params.priority && params.priority !== "all") {
      searchParams.append("priority", params.priority.trim());
    }
    if (params.department && params.department !== "all") {
      searchParams.append("department", params.department.trim());
    }
  }
  const queryString = searchParams.toString();
  return apiClient<PetitionListResponse>(`/api/v1/petitions${queryString ? `?${queryString}` : ""}`);
}

export async function processEmail(payload: ProcessEmailRequest): Promise<ProcessEmailResponse> {
  return apiClient<ProcessEmailResponse>("/api/v1/zapier/process-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── React Query Hooks ──────────────────────────────────────────────────────

export function useDashboard(
  options?: Omit<UseQueryOptions<DashboardStats, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<DashboardStats, ApiError>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    ...options,
  });
}

export function useAnalytics(
  options?: Omit<UseQueryOptions<AnalyticsStats, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<AnalyticsStats, ApiError>({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    ...options,
  });
}

export function usePetition(
  id: number,
  options?: Omit<UseQueryOptions<Petition, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<Petition, ApiError>({
    queryKey: ["petition", id],
    queryFn: () => fetchPetition(id),
    enabled: Boolean(id && !isNaN(id)),
    ...options,
  });
}

export function usePetitionList(
  params?: PetitionListParams,
  options?: Omit<UseQueryOptions<PetitionListResponse, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<PetitionListResponse, ApiError>({
    queryKey: ["petitions", params],
    queryFn: () => fetchPetitionList(params),
    ...options,
  });
}

export function useProcessEmailMutation(
  options?: UseMutationOptions<ProcessEmailResponse, ApiError, ProcessEmailRequest>
) {
  return useMutation<ProcessEmailResponse, ApiError, ProcessEmailRequest>({
    mutationFn: processEmail,
    ...options,
  });
}
