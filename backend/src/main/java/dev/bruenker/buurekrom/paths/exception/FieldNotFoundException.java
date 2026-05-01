package dev.bruenker.buurekrom.paths.exception;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public class FieldNotFoundException extends NotFoundException {

    private static final String MESSAGE_TEMPLATE = "Field not found: %s";

    public FieldNotFoundException(@Nonnull final Long id) {
        super(MESSAGE_TEMPLATE.formatted(requireNonNull(id, "id")));
    }
}
