import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/http";

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

const routesKey = ["routes"] as const;

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
