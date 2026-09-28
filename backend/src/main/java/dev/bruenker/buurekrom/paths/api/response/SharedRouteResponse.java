package dev.bruenker.buurekrom.paths.api.response;

import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonLineString;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import static java.util.Objects.requireNonNull;

public record SharedRouteResponse(
        @Nonnull Long id,
        @Nullable String name,
        @Nonnull GeoJsonLineString geometry
) {

    public SharedRouteResponse {
        requireNonNull(id, "id");
        requireNonNull(geometry, "geometry");
    }

    @Nonnull
    public static SharedRouteResponse from(@Nonnull final Route route, @Nonnull final GeoJsonConverter converter) {
        requireNonNull(route, "route");
        requireNonNull(converter, "converter");
        return new SharedRouteResponse(
                requireNonNull(route.getId(), "route.id"),
                route.getName(),
                converter.toGeoJson(route.getGeometry())
        );
    }
}
