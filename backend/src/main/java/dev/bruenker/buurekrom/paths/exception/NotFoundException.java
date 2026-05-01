package dev.bruenker.buurekrom.paths.exception;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public abstract class NotFoundException extends RuntimeException {

    protected NotFoundException(@Nonnull final String message) {
        super(requireNonNull(message, "message"));
    }
}
