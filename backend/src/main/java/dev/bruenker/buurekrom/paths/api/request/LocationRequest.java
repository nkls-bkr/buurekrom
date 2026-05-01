package dev.bruenker.buurekrom.paths.api.request;

import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonPoint;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import static java.util.Objects.requireNonNull;

public record LocationRequest(
        @Nullable String name,
        @Nonnull GeoJsonPoint geometry
) {

    public LocationRequest {
        requireNonNull(geometry, "geometry");
    }
}