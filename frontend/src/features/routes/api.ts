import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/http";
import { ApiError } from "@/shared/api-error";

interface GeoJsonLineString {
  type: "LineString";
  coordinates: number[][];
}

interface CreateRouteRequest {
  name: string | null;
  geometry: GeoJsonLineString;
}

export interface RouteResponse {
  id: number;
  name: string | null;
  geometry: GeoJsonLineString;
  createdAt: string | null;
}

export interface PublicRouteResponse {
  id: number;
  name: string | null;
  geometry: GeoJsonLineString;
}

interface ShareTokenResponse {
  shareToken: string;
}

const routesKey = ["routes"] as const;
const sharedRouteKey = (token: string) => ["routes", "shared", token] as const;

async function fetchRoutes(): Promise<RouteResponse[]> {
  return apiFetch<RouteResponse[]>(`/routes`);
}

async function createRoute(
  request: CreateRouteRequest,
): Promise<RouteResponse> {
  return apiFetch<RouteResponse>(`/routes`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

async function deleteRoute(routeId: number): Promise<void> {
  await apiFetch<void>(`/routes/${routeId}`, {
    method: "DELETE",
  });
}

async function shareRoute(routeId: number): Promise<ShareTokenResponse> {
  return apiFetch<ShareTokenResponse>(`/routes/${routeId}/share`, {
    method: "POST",
  });
}

async function fetchSharedRoute(token: string): Promise<PublicRouteResponse> {
  const response = await fetch(
    `/api/public/routes/${encodeURIComponent(token)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  return (await response.json()) as PublicRouteResponse;
}

export function useRoutes() {
  return useQuery({
    queryKey: routesKey,
    queryFn: fetchRoutes,
  });
}

export function useCreateRouteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateRouteRequest) => createRoute(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: routesKey }),
  });
}

export function useDeleteRouteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routeId: number) => deleteRoute(routeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: routesKey }),
  });
}

export function useShareRouteMutation() {
  return useMutation({
    mutationFn: (routeId: number) => shareRoute(routeId),
  });
}

export function useSharedRoute(token: string) {
  return useQuery({
    queryKey: sharedRouteKey(token),
    queryFn: () => fetchSharedRoute(token),
    retry: false,
  });
}
