export class ApiError extends Error {
  status: number;
  statusText: string;
  data: unknown;

  constructor(status: number, statusText: string, data: unknown, message?: string) {
    super(message || `API Error (${status}): ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === "string") {
    return envUrl.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:8000";
};

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(0, "Network Error", null, err instanceof Error ? err.message : "Failed to fetch from backend API");
  }

  if (!res.ok) {
    let errorData: unknown = null;
    try {
      errorData = await res.json();
    } catch {
      try {
        errorData = await res.text();
      } catch {
        errorData = null;
      }
    }
    const detailMsg =
      errorData && typeof errorData === "object" && "detail" in errorData
        ? String((errorData as { detail: unknown }).detail)
        : undefined;

    throw new ApiError(res.status, res.statusText, errorData, detailMsg);
  }

  return res.json() as Promise<T>;
}
