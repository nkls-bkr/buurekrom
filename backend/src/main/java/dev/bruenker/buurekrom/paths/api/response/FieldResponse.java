package dev.bruenker.buurekrom.paths.api.response;

import dev.bruenker.buurekrom.paths.model.Field;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonPolygon;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import java.time.LocalDateTime;

import static java.util.Objects.requireNonNull;

public record FieldResponse(
        @Nonnull Long id,
        @Nonnull String name,
        @Nonnull GeoJsonPolygon geometry,
        @Nullable LocalDateTime createdAt,
        @Nullable LocalDateTime updatedAt
) {

    public FieldResponse {
        requireNonNull(id, "id");
        requireNonNull(name, "name");
        requireNonNull(geometry, "geometry");
    }

    @Nonnull
    public static FieldResponse from(@Nonnull final Field field, @Nonnull final GeoJsonConverter converter) {
        requireNonNull(field, "field");
        requireNonNull(converter, "converter");

        return new FieldResponse(
                requireNonNull(field.getId(), "field.id"),
                field.getName(),
                converter.toGeoJson(field.getGeometry()),
                field.getCreatedAt(),
                field.getUpdatedAt()
        );
    }
}
