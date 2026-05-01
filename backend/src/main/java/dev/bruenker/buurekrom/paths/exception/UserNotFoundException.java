package dev.bruenker.buurekrom.paths.exception;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public class UserNotFoundException extends NotFoundException {

    private static final String MESSAGE_TEMPLATE = "User not found: %s";

    public UserNotFoundException(@Nonnull final String username) {
        super(MESSAGE_TEMPLATE.formatted(requireNonNull(username, "username")));
    }
}
