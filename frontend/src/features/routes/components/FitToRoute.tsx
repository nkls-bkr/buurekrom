import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { fitToCoordinates } from "@/features/map/mapNavigation";
import type { PublicRouteResponse } from "@/features/routes/api";

export function FitToRoute({ route }: { route: PublicRouteResponse }) {
  const map = useMap();
  useEffect(() => {
    fitToCoordinates(map, route.geometry.coordinates);
  }, [map, route]);
  return null;
}