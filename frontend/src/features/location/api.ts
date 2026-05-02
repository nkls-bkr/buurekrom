import {apiFetch} from "@/shared/http.ts";
import {useQuery} from "@tanstack/react-query";

interface GeoJsonPoint {
    type: "Point";
    coordinates: number[][];
}

export interface LocationResponse {
    id: number;
    name: string | null;
    geometry: GeoJsonPoint;
}

const LOCATIONS_KEY = ['locations'] as const;

async function fetchLocations(): Promise<LocationResponse[]> {
    return apiFetch<LocationResponse[]>("/locations");
}

export function useLocations() {
    return useQuery({ queryKey: LOCATIONS_KEY, queryFn: fetchLocations });
}