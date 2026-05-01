package dev.bruenker.buurekrom.paths.shared.geojson;

import jakarta.annotation.Nonnull;

import java.util.List;

import static java.util.Objects.requireNonNull;

public record GeoJsonPolygon(
        @Nonnull String type,
        @Nonnull List<List<List<Double>>> coordinates
) {

    public static final String TYPE = "Polygon";

    public GeoJsonPolygon {
        requireNonNull(type, "type");
        requireNonNull(coordinates, "coordinates");
    }

    public GeoJsonPolygon(@Nonnull final List<List<List<Double>>> coordinates) {
        this(TYPE, coordinates);
    }
}
