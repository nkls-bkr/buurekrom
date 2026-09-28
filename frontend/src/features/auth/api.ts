import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/http.ts";
import { ApiError } from "@/shared/api-error.ts";

export interface LoginRequest {
  password: string;
}

export interface AuthSession {
  authenticated: boolean;
}

export const SESSION_QUERY_KEY = ["auth", "session"] as const;

async function login(request: LoginRequest): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

async function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

async function fetchAuthSession(): Promise<AuthSession | null> {
  try {
    return await apiFetch<AuthSession>("/auth/session");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
    },
  });
}

export function useAuthSession() {
  return useQuery<AuthSession | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchAuthSession,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
  });
}
