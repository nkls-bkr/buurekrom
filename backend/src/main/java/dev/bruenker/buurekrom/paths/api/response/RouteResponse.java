package dev.bruenker.buurekrom.paths.api.response;

import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonLineString;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import java.time.LocalDateTime;

import static java.util.Objects.requireNonNull;

public record RouteResponse(
        @Nonnull Long id,
        @Nullable String name,
        @Nonnull GeoJsonLineString geometry,
        @Nonnull Long fieldId,
        @Nullable LocalDateTime createdAt
) {

    public RouteResponse {
        requireNonNull(id, "id");
        requireNonNull(geometry, "geometry");
        requireNonNull(fieldId, "fieldId");
    }

    @Nonnull
    public static RouteResponse from(@Nonnull final Route route, @Nonnull final GeoJsonConverter converter) {
        requireNonNull(route, "route");
        requireNonNull(converter, "converter");
        return new RouteResponse(
                requireNonNull(route.getId(), "route.id"),
                route.getName(),
                converter.toGeoJson(route.getGeometry()),
                requireNonNull(route.getField().getId(), "route.field.id"),
                route.getCreatedAt()
        );
    }
}
