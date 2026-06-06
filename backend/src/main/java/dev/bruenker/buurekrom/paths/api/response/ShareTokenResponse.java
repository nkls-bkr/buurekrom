package dev.bruenker.buurekrom.paths.api.response;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public record ShareTokenResponse(@Nonnull String shareToken) {

    public ShareTokenResponse {
        requireNonNull(shareToken, "shareToken");
    }
}
