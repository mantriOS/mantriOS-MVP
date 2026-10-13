import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient, ApiError, getBaseUrl } from "@/lib/api";
import type {
  EmailBrandingConfig,
  SharedSignature,
  ForwardPetitionPayload,
  ForwardPetitionResult,
} from "@/types/branding";

// ── API Requests ─────────────────────────────────────────────────────────────

export async function fetchBrandingConfig(): Promise<EmailBrandingConfig> {
  return apiClient<EmailBrandingConfig>("/api/v1/branding/config");
}

export async function uploadHeaderImage(file: File): Promise<EmailBrandingConfig> {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/branding/upload/header`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new ApiError(errorBody.detail || "Header upload failed", res.status);
  }
  return res.json();
}

export async function saveHtmlHeader(headerHtml: string): Promise<EmailBrandingConfig> {
  return apiClient<EmailBrandingConfig>("/api/v1/branding/header/html", {
    method: "POST",
    body: JSON.stringify({ header_html: headerHtml }),
  });
}

export async function deleteHeaderImage(): Promise<EmailBrandingConfig> {
  return apiClient<EmailBrandingConfig>("/api/v1/branding/header", {
    method: "DELETE",
  });
}


export async function uploadFooterImage(file: File): Promise<EmailBrandingConfig> {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/branding/upload/footer`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new ApiError(errorBody.detail || "Footer upload failed", res.status);
  }
  return res.json();
}

export async function saveHtmlFooter(footerHtml: string): Promise<EmailBrandingConfig> {
  return apiClient<EmailBrandingConfig>("/api/v1/branding/footer/html", {
    method: "POST",
    body: JSON.stringify({ footer_html: footerHtml }),
  });
}

export async function deleteFooterImage(): Promise<EmailBrandingConfig> {
  return apiClient<EmailBrandingConfig>("/api/v1/branding/footer", {
    method: "DELETE",
  });
}


export async function fetchSignatures(): Promise<SharedSignature[]> {
  return apiClient<SharedSignature[]>("/api/v1/branding/signatures");
}

export async function createSignature(name: string, file: File): Promise<SharedSignature> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("file", file);

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/branding/signatures`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new ApiError(errorBody.detail || "Signature creation failed", res.status);
  }
  return res.json();
}

export async function updateSignature(id: number, name?: string, file?: File): Promise<SharedSignature> {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (file) formData.append("file", file);

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/branding/signatures/${id}`, {
    method: "PATCH",
    body: formData,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new ApiError(errorBody.detail || "Signature update failed", res.status);
  }
  return res.json();
}


export async function deleteSignature(id: number): Promise<{ success: boolean; deleted_id: number }> {
  return apiClient<{ success: boolean; deleted_id: number }>(`/api/v1/branding/signatures/${id}`, {
    method: "DELETE",
  });
}

export async function forwardPetitionEmail(payload: ForwardPetitionPayload): Promise<ForwardPetitionResult> {
  return apiClient<ForwardPetitionResult>("/api/v1/branding/forward-petition", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── React Query Hooks ────────────────────────────────────────────────────────

export function useBrandingConfig(
  options?: Omit<UseQueryOptions<EmailBrandingConfig, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<EmailBrandingConfig, ApiError>({
    queryKey: ["branding-config"],
    queryFn: fetchBrandingConfig,
    staleTime: 60_000,
    ...options,
  });
}

export function useSignatures(
  options?: Omit<UseQueryOptions<SharedSignature[], ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<SharedSignature[], ApiError>({
    queryKey: ["shared-signatures"],
    queryFn: fetchSignatures,
    staleTime: 30_000,
    ...options,
  });
}

export function useBrandingMutations() {
  const queryClient = useQueryClient();

  const headerUpload = useMutation({
    mutationFn: uploadHeaderImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branding-config"] }),
  });

  const headerDelete = useMutation({
    mutationFn: deleteHeaderImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branding-config"] }),
  });

  const headerHtmlSave = useMutation({
    mutationFn: saveHtmlHeader,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branding-config"] }),
  });

  const footerUpload = useMutation({
    mutationFn: uploadFooterImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branding-config"] }),
  });

  const footerHtmlSave = useMutation({
    mutationFn: saveHtmlFooter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branding-config"] }),
  });

  const footerDelete = useMutation({
    mutationFn: deleteFooterImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branding-config"] }),
  });

  const signatureCreate = useMutation({
    mutationFn: ({ name, file }: { name: string; file: File }) => createSignature(name, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared-signatures"] }),
  });

  const signatureUpdate = useMutation({
    mutationFn: ({ id, name, file }: { id: number; name?: string; file?: File }) =>
      updateSignature(id, name, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared-signatures"] }),
  });

  const signatureDelete = useMutation({
    mutationFn: (id: number) => deleteSignature(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared-signatures"] }),
  });

  const forwardPetition = useMutation({
    mutationFn: forwardPetitionEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petition"] });
      queryClient.invalidateQueries({ queryKey: ["petitions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    headerUpload,
    headerDelete,
    headerHtmlSave,
    footerUpload,
    footerHtmlSave,
    footerDelete,
    signatureCreate,
    signatureUpdate,
    signatureDelete,
    forwardPetition,
  };
}


