package dev.bruenker.buurekrom.paths.exception;

import jakarta.annotation.Nonnull;

import static java.util.Objects.requireNonNull;

public class RouteNotFoundException extends NotFoundException {

    private static final String MESSAGE_TEMPLATE = "Route not found: %s";
    private static final String MESSAGE_TEMPLATE_IN_FIELD = "Route %s not found in field %s";

    public RouteNotFoundException(@Nonnull final Long routeId) {
        super(MESSAGE_TEMPLATE.formatted(requireNonNull(routeId, "routeId")));
    }

    public RouteNotFoundException(@Nonnull final Long fieldId, @Nonnull final Long routeId) {
        super(MESSAGE_TEMPLATE_IN_FIELD.formatted(
                requireNonNull(routeId, "routeId"),
                requireNonNull(fieldId, "fieldId")
        ));
    }
}
