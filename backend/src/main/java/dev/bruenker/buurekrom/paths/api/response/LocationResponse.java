package dev.bruenker.buurekrom.paths.api.response;

import dev.bruenker.buurekrom.paths.model.Location;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonPoint;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import java.time.LocalDateTime;

import static java.util.Objects.requireNonNull;

public record LocationResponse(
        @Nonnull Long id,
        @Nullable String name,
        @Nonnull GeoJsonPoint geometry,
        //TODO createdAt weg
        @Nullable LocalDateTime createdAt
) {

    public LocationResponse {
        requireNonNull(id, "id");
        requireNonNull(geometry, "geometry");
    }

    @Nonnull
    public static LocationResponse from(@Nonnull final Location location, @Nonnull final GeoJsonConverter converter) {
        requireNonNull(location, "location");
        requireNonNull(converter, "converter");

        return new LocationResponse(
                requireNonNull(location.getId(), "location.id"),
                location.getName(),
                converter.toGeoJson(location.getGeometry()),
                location.getCreatedAt()
        );
    }
}