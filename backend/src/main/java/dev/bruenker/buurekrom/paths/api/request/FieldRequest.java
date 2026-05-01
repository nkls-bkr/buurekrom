package dev.bruenker.buurekrom.paths.api.request;

import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonPolygon;
import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public record FieldRequest(
        @Nonnull String name,
        @Nonnull GeoJsonPolygon geometry
) {

    public FieldRequest {
        requireNonNull(name, "name");
        requireNonNull(geometry, "geometry");
    }
}
