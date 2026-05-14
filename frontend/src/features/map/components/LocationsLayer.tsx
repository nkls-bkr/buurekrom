import { Marker } from "react-leaflet";
import L from "leaflet";
import { useLocations } from "@/features/location/api.ts";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

const pinSvg = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
  <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
</svg>`;

const ICON_DEFAULT = L.divIcon({
  html: pinSvg("#17341d"),
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const ICON_SELECTED = L.divIcon({
  html: pinSvg("#561a00"),
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export function LocationsLayer() {
  const { data: locations } = useLocations();
  const { isSelected, toggle } = useSelection();

  return (
    <>
      {locations?.map((location) => {
        const selected = isSelected(SelectionKind.Location, location.id);
        return (
          <Marker
            key={location.id}
            position={{
              lat: location.geometry.coordinates[1],
              lng: location.geometry.coordinates[0],
            }}
            icon={selected ? ICON_SELECTED : ICON_DEFAULT}
            eventHandlers={{
              click: () => toggle(SelectionKind.Location, location.id),
            }}
          />
        );
      })}
    </>
  );
}