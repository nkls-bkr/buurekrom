package dev.bruenker.buurekrom.paths.api.response;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public record LoginResponse(@Nonnull String username) {

    public LoginResponse {
        requireNonNull(username, "username");
    }
}
