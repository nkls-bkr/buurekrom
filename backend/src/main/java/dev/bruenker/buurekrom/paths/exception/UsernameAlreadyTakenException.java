package dev.bruenker.buurekrom.paths.exception;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public class UsernameAlreadyTakenException extends RuntimeException {

    private static final String MESSAGE_TEMPLATE = "Username already taken: %s";

    public UsernameAlreadyTakenException(@Nonnull final String username) {
        super(MESSAGE_TEMPLATE.formatted(requireNonNull(username, "username")));
    }
}
