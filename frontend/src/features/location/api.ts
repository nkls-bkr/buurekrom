import { apiFetch } from "@/shared/http.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GeoJsonPoint {
  type: "Point";
  coordinates: number[];
}

interface CreateLocationRequest {
  name: string;
  geometry: GeoJsonPoint;
}

export interface LocationResponse {
  id: number;
  name: string | null;
  geometry: GeoJsonPoint;
}

const LOCATIONS_KEY = ["locations"] as const;

async function fetchLocations(): Promise<LocationResponse[]> {
  return apiFetch<LocationResponse[]>("/locations");
}

async function createLocation(
  request: CreateLocationRequest,
): Promise<LocationResponse> {
  return apiFetch<LocationResponse>("/locations", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function useLocations() {
  return useQuery({ queryKey: LOCATIONS_KEY, queryFn: fetchLocations });
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY }),
  });
}
