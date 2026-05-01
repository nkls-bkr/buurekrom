package dev.bruenker.buurekrom.paths.api.request;

import jakarta.annotation.Nonnull;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Nonnull String username,
        @NotBlank @Nonnull String password
) {
}
