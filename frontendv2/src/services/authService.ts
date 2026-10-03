import { apiClient, ApiError } from "@/lib/api";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

export { ApiError } from "@/lib/api";

const TOKEN_KEY = "mantrios_auth_token";

/**
 * Service for managing authentication API calls and token persistence.
 *
 * NOTE: The FastAPI backend currently does not provide `/api/v1/auth/login` or
 * `/api/v1/auth/me` endpoints. This service provides the exact interface and
 * error handling structure required once the backend endpoints are added.
 */

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    return await apiClient<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      throw new ApiError(
        404,
        "Not Found",
        null,
        "Authentication API endpoint (POST /api/v1/auth/login) is not yet implemented on the FastAPI backend."
      );
    }
    throw err;
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const token = getStoredToken();
  if (!token) {
    throw new ApiError(401, "Unauthorized", null, "No authentication token found.");
  }
  return apiClient<User>("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function logout(): Promise<void> {
  removeStoredToken();
}
