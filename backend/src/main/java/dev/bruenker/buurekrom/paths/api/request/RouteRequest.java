package dev.bruenker.buurekrom.paths.api.request;

import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonLineString;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import static java.util.Objects.requireNonNull;

public record RouteRequest(
        @Nullable String name,
        @Nonnull GeoJsonLineString geometry
) {

    public RouteRequest {
        requireNonNull(geometry, "geometry");
    }
}
