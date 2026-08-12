import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function fetcher(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetcher("/api/v1/analytics"),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetcher("/api/v1/dashboard"),
  });
}

export function usePetition(id: number) {
  return useQuery({
    queryKey: ["petition", id],
    queryFn: () => fetcher(`/api/v1/petitions/${id}`),
  });
}

export function usePetitionList(params?: any) {
  return useQuery({
    queryKey: ["petitions", params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            searchParams.append(key, String(val));
          }
        });
      }
      const qs = searchParams.toString();
      return fetcher(`/api/v1/petitions${qs ? "?" + qs : ""}`);
    },
  });
}
