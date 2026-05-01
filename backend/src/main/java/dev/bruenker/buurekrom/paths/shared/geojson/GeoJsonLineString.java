package dev.bruenker.buurekrom.paths.shared.geojson;

import jakarta.annotation.Nonnull;

import java.util.List;

import static java.util.Objects.requireNonNull;

public record GeoJsonLineString(
        @Nonnull String type,
        @Nonnull List<List<Double>> coordinates
) {

    public static final String TYPE = "LineString";

    public GeoJsonLineString {
        requireNonNull(type, "type");
        requireNonNull(coordinates, "coordinates");
    }

    public GeoJsonLineString(@Nonnull final List<List<Double>> coordinates) {
        this(TYPE, coordinates);
    }
}
