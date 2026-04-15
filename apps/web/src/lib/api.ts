import type { ApiResponse } from "@trello-clone/shared";

const DEFAULT_API_BASE = "http://localhost:4000/api";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("trello_token");
}

export async function apiPatch<TResponse, TBody>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  return apiRequest<TResponse, TBody>("PATCH", endpoint, body);
}

export async function apiGet<TResponse>(endpoint: string): Promise<TResponse> {
  return apiRequest<TResponse, undefined>("GET", endpoint);
}

export async function apiPost<TResponse, TBody>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  return apiRequest<TResponse, TBody>("POST", endpoint, body);
}

async function apiRequest<TResponse, TBody>(
  method: "GET" | "POST" | "PATCH",
  endpoint: string,
  body?: TBody
): Promise<TResponse> {
  const token = getAuthToken();
  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = (await response.json()) as ApiResponse<TResponse> & {
    error?: string;
  };

  if (!response.ok || !json.success) {
    throw new Error(json.error || "Request failed");
  }

  return json.data;
}
