import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
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
  fieldId: number;
  createdAt: string | null;
}

const routesKey = (fieldId: number) => ["routes", fieldId] as const;

async function fetchRoutes(fieldId: number): Promise<RouteResponse[]> {
  return apiFetch<RouteResponse[]>(`/fields/${fieldId}/routes`);
}

async function createRoute(
  fieldId: number,
  request: CreateRouteRequest,
): Promise<RouteResponse> {
  return apiFetch<RouteResponse>(`/fields/${fieldId}/routes`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

async function deleteRoute(fieldId: number, routeId: number): Promise<void> {
  await apiFetch<void>(`/fields/${fieldId}/routes/${routeId}`, {
    method: "DELETE",
  });
}

export function useRoutesForFields(fieldIds: readonly number[]) {
  return useQueries({
    queries: fieldIds.map((id) => ({
      queryKey: routesKey(id),
      queryFn: () => fetchRoutes(id),
    })),
  });
}

export function useCreateRouteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fieldId,
      request,
    }: {
      fieldId: number;
      request: CreateRouteRequest;
    }) => createRoute(fieldId, request),
    onSuccess: (_route, { fieldId }) =>
      queryClient.invalidateQueries({ queryKey: routesKey(fieldId) }),
  });
}

export function useDeleteRouteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, routeId }: { fieldId: number; routeId: number }) =>
      deleteRoute(fieldId, routeId),
    onSuccess: (_v, { fieldId }) =>
      queryClient.invalidateQueries({ queryKey: routesKey(fieldId) }),
  });
}
