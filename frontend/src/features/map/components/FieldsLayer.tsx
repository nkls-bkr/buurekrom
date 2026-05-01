import { Polygon } from "react-leaflet";
import { useFields } from "@/features/fields/api";

interface FieldsLayerProps {
  selectedIds: ReadonlySet<number>;
  onToggleSelect: (id: number) => void;
}

export function FieldsLayer({ selectedIds, onToggleSelect }: FieldsLayerProps) {
  const { data: fields } = useFields();

  return (
    <>
      {fields?.map((field) => {
        const selected = selectedIds.has(field.id);
        return (
          <Polygon
            key={field.id}
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
            eventHandlers={{ click: () => onToggleSelect(field.id) }}
          />
        );
      })}
    </>
  );
}
