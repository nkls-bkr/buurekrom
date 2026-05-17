package dev.bruenker.buurekrom.paths.exception;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public class RouteNotFoundException extends NotFoundException {

    private static final String MESSAGE_TEMPLATE = "Route not found: %s";

    public RouteNotFoundException(@Nonnull final Long routeId) {
        super(MESSAGE_TEMPLATE.formatted(requireNonNull(routeId, "routeId")));
    }
}
