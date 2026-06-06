import { latLngBounds, type FitBoundsOptions, type Map } from "leaflet";

const DEFAULT_FIT_OPTIONS: FitBoundsOptions = {
  padding: [48, 48],
  maxZoom: 17,
};

export function fitToCoordinates(
  map: Map,
  coordinates: number[][],
  options: FitBoundsOptions = DEFAULT_FIT_OPTIONS,
) {
  if (coordinates.length === 0) return;
  const bounds = latLngBounds(coordinates.map(([lng, lat]) => [lat, lng]));
  map.fitBounds(bounds, options);
}
