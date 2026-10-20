package dev.bruenker.buurekrom.paths.shared.geojson;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeoJsonConverterTest {
    private final GeoJsonConverter converter = new GeoJsonConverter();

    @Test
    void acceptsRouteReturningToItsStart() {
        final GeoJsonLineString route = new GeoJsonLineString(List.of(
                List.of(10.0, 50.0), List.of(11.0, 51.0), List.of(10.0, 50.0)));
        assertThat(converter.toLineString(route).getNumPoints()).isEqualTo(3);
    }

    @Test
    void rejectsCoincidentPoints() {
        final GeoJsonLineString route = new GeoJsonLineString(List.of(
                List.of(10.0, 50.0), List.of(10.0, 50.0)));
        assertThatThrownBy(() -> converter.toLineString(route))
                .isInstanceOf(InvalidGeoJsonException.class);
    }

    @Test
    void rejectsInvalidCoordinatesAndTooFewPoints() {
        for (final double longitude : new double[]{Double.NaN, Double.POSITIVE_INFINITY, 181}) {
            final GeoJsonLineString route = new GeoJsonLineString(List.of(
                    List.of(10.0, 50.0), List.of(longitude, 51.0)));
            assertThatThrownBy(() -> converter.toLineString(route))
                    .isInstanceOf(InvalidGeoJsonException.class);
        }
        assertThatThrownBy(() -> converter.toLineString(
                new GeoJsonLineString(List.of(List.of(10.0, 50.0)))))
                .isInstanceOf(InvalidGeoJsonException.class);
    }
}
