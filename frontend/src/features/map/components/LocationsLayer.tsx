import { Marker, Pane, Tooltip } from "react-leaflet";
import { useLocations } from "@/features/location/api.ts";
import {
  LOCATION_ICON,
  LOCATION_ICON_SELECTED,
} from "@/features/map/components/locationIcon";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";
import {
  LOCATIONS_PANE,
  Z_INDEX_LOCATION_MARKER,
  Z_INDEX_LOCATIONS_PANE,
} from "@/shared/z-index.layers.ts";

export function LocationsLayer() {
  const { data: locations } = useLocations();
  const { isSelected, toggle } = useSelection();

  return (
    <Pane name={LOCATIONS_PANE} style={{ zIndex: Z_INDEX_LOCATIONS_PANE }}>
      {locations?.map((location) => {
        const selected = isSelected(SelectionKind.Location, location.id);
        return (
          <Marker
            zIndexOffset={Z_INDEX_LOCATION_MARKER}
            key={location.id}
            pane={LOCATIONS_PANE}
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
    </Pane>
  );
}
