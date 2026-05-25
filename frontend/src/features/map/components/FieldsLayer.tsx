import { Pane, Polygon } from "react-leaflet";
import { useFields } from "@/features/fields/api";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";
import { FIELDS_PANE, Z_INDEX_FIELDS_PANE } from "@/shared/z-index.layers.ts";

export function FieldsLayer() {
  const { data: fields } = useFields();
  const { isSelected, toggle } = useSelection();

  return (
    <Pane name={FIELDS_PANE} style={{ zIndex: Z_INDEX_FIELDS_PANE }}>
      {fields?.map((field) => {
        const selected = isSelected(SelectionKind.Field, field.id);
        return (
          <Polygon
            key={field.id}
            pane={FIELDS_PANE}
            positions={field.geometry.coordinates[0].map(([lng, lat]) => [
              lat,
              lng,
            ])}
            pathOptions={
              selected
                ? {
                    color: "#561a00",
                    fillColor: "#772d0c",
                    fillOpacity: 0.55,
                    weight: 3,
                  }
                : {
                    color: "#17341d",
                    fillColor: "#2d4b32",
                    fillOpacity: 0.35,
                    weight: 2,
                  }
            }
            eventHandlers={{ click: () => toggle("field", field.id) }}
          />
        );
      })}
    </Pane>
  );
}
