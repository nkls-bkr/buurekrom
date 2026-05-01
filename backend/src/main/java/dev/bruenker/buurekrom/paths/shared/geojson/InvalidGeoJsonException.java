package dev.bruenker.buurekrom.paths.shared.geojson;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public class InvalidGeoJsonException extends RuntimeException {

    public InvalidGeoJsonException(@Nonnull final String message) {
        super(requireNonNull(message, "message"));
    }
}
