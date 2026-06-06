package dev.bruenker.buurekrom.paths.api;

import jakarta.annotation.Nonnull;

public final class RouteFixtures {

    private RouteFixtures() {
    }

    @Nonnull
    public static TestRouteBuilder aRoute() {
        return TestRouteBuilder.builder()
                .withPoint(10.0, 50.0)
                .withPoint(10.1, 50.1);
    }
}
