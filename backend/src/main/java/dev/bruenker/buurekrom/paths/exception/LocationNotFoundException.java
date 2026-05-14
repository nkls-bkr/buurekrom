package dev.bruenker.buurekrom.paths.exception;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public class LocationNotFoundException extends NotFoundException {

    private static final String MESSAGE_TEMPLATE = "Location not found: %s";

    public LocationNotFoundException(@Nonnull final Long id) {
        super(MESSAGE_TEMPLATE.formatted(requireNonNull(id, "id")));
    }
}