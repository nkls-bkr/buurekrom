import { Marker, Tooltip } from "react-leaflet";
import { useLocations } from "@/features/location/api.ts";
import {
  LOCATION_ICON,
  LOCATION_ICON_SELECTED,
} from "@/features/map/components/locationIcon";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

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
            icon={selected ? LOCATION_ICON_SELECTED : LOCATION_ICON}
            eventHandlers={{
              click: () => toggle(SelectionKind.Location, location.id),
            }}
          >
            {selected && location.name && (
              <Tooltip permanent direction="top" offset={[0, -32]}>
                {location.name}
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </>
  );
}