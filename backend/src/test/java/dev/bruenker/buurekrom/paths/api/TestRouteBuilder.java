package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.model.Route;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;

import java.util.ArrayList;
import java.util.List;

public final class TestRouteBuilder {

    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Nullable
    private String name;

    @Nonnull
    private final List<Coordinate> points = new ArrayList<>();

    private TestRouteBuilder() {
    }

    @Nonnull
    public static TestRouteBuilder builder() {
        return new TestRouteBuilder();
    }

    @Nonnull
    public TestRouteBuilder withName(@Nullable final String name) {
        this.name = name;
        return this;
    }

    @Nonnull
    public TestRouteBuilder withPoint(final double lng, final double lat) {
        points.add(new Coordinate(lng, lat));
        return this;
    }

    @Nonnull
    public Route build() {
        final Route route = new Route();
        route.setName(name);
        route.setGeometry(GEOMETRY_FACTORY.createLineString(points.toArray(new Coordinate[0])));
        return route;
    }
}
