import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/http.ts";
import { ApiError } from "@/shared/api-error.ts";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
}

export const ME_QUERY_KEY = ["auth", "me"] as const;

async function login(request: LoginRequest): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

async function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

async function fetchMe(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>("/auth/me");
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
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.removeQueries();
    },
  });
}

export function useMe() {
  return useQuery<AuthUser | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
