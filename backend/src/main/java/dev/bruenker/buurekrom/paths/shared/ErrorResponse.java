package dev.bruenker.buurekrom.paths.shared;

import jakarta.annotation.Nonnull;

import java.time.Instant;

import static java.util.Objects.requireNonNull;

public record ErrorResponse(
        @Nonnull Instant timestamp,
        int status,
        @Nonnull String error,
        @Nonnull String message
) {

    public ErrorResponse {
        requireNonNull(timestamp, "timestamp");
        requireNonNull(error, "error");
        requireNonNull(message, "message");
    }

    @Nonnull
    public static ErrorResponse of(final int status, @Nonnull final String error, @Nonnull final String message) {
        requireNonNull(error, "error");
        requireNonNull(message, "message");

        return new ErrorResponse(Instant.now(), status, error, message);
    }
}
