package dev.bruenker.buurekrom.paths.shared.geojson;

import jakarta.annotation.Nonnull;

import java.util.List;

import static java.util.Objects.requireNonNull;

public record GeoJsonPoint(
        @Nonnull String type,
        @Nonnull List<Double> coordinates
) {

    public static final String TYPE = "Point";

    public GeoJsonPoint {
        requireNonNull(type, "type");
        requireNonNull(coordinates, "coordinates");
    }

    public GeoJsonPoint(@Nonnull final List<Double> coordinates) {
        this(TYPE, coordinates);
    }
}