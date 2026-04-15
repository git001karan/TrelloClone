"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";

const AUTH_TOKEN_KEY = "trello_token";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const token = getToken();

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiGet<AuthUser>("/auth/me"),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isError) {
      clearToken();
    }
  }, [meQuery.isError]);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginInput) =>
      apiPost<AuthResponse, LoginInput>("/auth/login", payload),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterInput) =>
      apiPost<AuthResponse, RegisterInput>("/auth/register", payload),
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });

  const logout = () => {
    clearToken();
    queryClient.removeQueries({ queryKey: ["auth", "me"] });
  };

  return {
    user: meQuery.data ?? null,
    isAuthenticated: !!meQuery.data,
    isCheckingAuth: !!token && meQuery.isLoading,
    authError: meQuery.error instanceof Error ? meQuery.error.message : null,
    loginMutation,
    registerMutation,
    logout,
  };
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
