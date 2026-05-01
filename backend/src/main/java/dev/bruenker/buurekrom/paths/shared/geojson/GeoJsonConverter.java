package dev.bruenker.buurekrom.paths.shared.geojson;

import jakarta.annotation.Nonnull;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static java.util.Objects.requireNonNull;

@Component
public class GeoJsonConverter {

    public static final int SRID_WGS84 = 4326;

    @Nonnull
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), SRID_WGS84);

    @Nonnull
    public Polygon toPolygon(@Nonnull final GeoJsonPolygon geoJson) {
        requireNonNull(geoJson, "geoJson");
        if (!GeoJsonPolygon.TYPE.equals(geoJson.type())) {
            throw new InvalidGeoJsonException("Expected type '%s' but got '%s'"
                    .formatted(GeoJsonPolygon.TYPE, geoJson.type()));
        }

        final List<List<List<Double>>> rings = geoJson.coordinates();
        if (rings.isEmpty()) {
            throw new InvalidGeoJsonException("Polygon must have at least one linear ring");
        }

        final LinearRing shell = geometryFactory.createLinearRing(toCoordinates(rings.getFirst()));
        final LinearRing[] holes = new LinearRing[rings.size() - 1];
        for (int i = 1; i < rings.size(); i++) {
            holes[i - 1] = geometryFactory.createLinearRing(toCoordinates(rings.get(i)));
        }

        return geometryFactory.createPolygon(shell, holes);
    }

    @Nonnull
    public GeoJsonPolygon toGeoJson(@Nonnull final Polygon polygon) {
        requireNonNull(polygon, "polygon");

        final List<List<List<Double>>> rings = new ArrayList<>(1 + polygon.getNumInteriorRing());
        rings.add(toCoordinateList(polygon.getExteriorRing().getCoordinates()));
        for (int i = 0; i < polygon.getNumInteriorRing(); i++) {
            rings.add(toCoordinateList(polygon.getInteriorRingN(i).getCoordinates()));
        }
        return new GeoJsonPolygon(rings);
    }

    @Nonnull
    public LineString toLineString(@Nonnull final GeoJsonLineString geoJson) {
        requireNonNull(geoJson, "geoJson");
        if (!GeoJsonLineString.TYPE.equals(geoJson.type())) {
            throw new InvalidGeoJsonException("Expected type '%s' but got '%s'"
                    .formatted(GeoJsonLineString.TYPE, geoJson.type()));
        }
        if (geoJson.coordinates().size() < 2) {
            throw new InvalidGeoJsonException("LineString must have at least 2 points");
        }

        return geometryFactory.createLineString(toCoordinates(geoJson.coordinates()));
    }

    @Nonnull
    public GeoJsonLineString toGeoJson(@Nonnull final LineString lineString) {
        requireNonNull(lineString, "lineString");
        return new GeoJsonLineString(toCoordinateList(lineString.getCoordinates()));
    }

    @Nonnull
    public Point toPoint(@Nonnull final GeoJsonPoint geoJson) {
        requireNonNull(geoJson, "geoJson");
        if (!GeoJsonPoint.TYPE.equals(geoJson.type())) {
            throw new InvalidGeoJsonException("Expected type '%s' but got '%s'"
                    .formatted(GeoJsonPoint.TYPE, geoJson.type()));
        }
        if (geoJson.coordinates().size() < 2) {
            throw new InvalidGeoJsonException("Point must have at least [longitude, latitude]");
        }

        final List<Double> c = geoJson.coordinates();
        return geometryFactory.createPoint(new Coordinate(c.get(0), c.get(1)));
    }

    @Nonnull
    public GeoJsonPoint toGeoJson(@Nonnull final Point point) {
        requireNonNull(point, "point");
        final Coordinate c = point.getCoordinate();
        return new GeoJsonPoint(List.of(c.getX(), c.getY()));
    }

    @Nonnull
    private Coordinate[] toCoordinates(@Nonnull final List<List<Double>> points) {
        final Coordinate[] coordinates = new Coordinate[points.size()];
        for (int i = 0; i < points.size(); i++) {
            final List<Double> point = points.get(i);
            if (point.size() < 2) {
                throw new InvalidGeoJsonException("Each coordinate needs at least [longitude, latitude]");
            }
            coordinates[i] = new Coordinate(point.get(0), point.get(1));
        }
        return coordinates;
    }

    @Nonnull
    private List<List<Double>> toCoordinateList(@Nonnull final Coordinate[] coordinates) {
        final List<List<Double>> points = new ArrayList<>(coordinates.length);
        for (final Coordinate c : coordinates) {
            points.add(List.of(c.getX(), c.getY()));
        }
        return points;
    }
}
