package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.exception.RouteNotFoundException;
import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.service.RouteService;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonLineString;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import dev.bruenker.buurekrom.paths.config.SecurityConfig;
import dev.bruenker.buurekrom.paths.config.JacksonConfig;
import org.springframework.context.annotation.Import;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SharedRouteController.class)
@Import({SecurityConfig.class, JacksonConfig.class})
class SharedRouteControllerTest {

    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RouteService routeService;

    @MockitoBean
    private GeoJsonConverter geoJsonConverter;

    @Test
    void findByShareToken_returnsRouteWithoutAuthentication() throws Exception {
        final LineString geometry = GEOMETRY_FACTORY.createLineString(new Coordinate[]{
                new Coordinate(10.0, 50.0),
                new Coordinate(10.1, 50.1)
        });
        final Route route = new Route(7L, "Feldweg", geometry, null, "abc");
        final GeoJsonLineString geoJson = new GeoJsonLineString(List.of(
                List.of(10.0, 50.0),
                List.of(10.1, 50.1)
        ));

        when(routeService.findByShareToken("abc")).thenReturn(route);
        when(geoJsonConverter.toGeoJson(geometry)).thenReturn(geoJson);

        mockMvc.perform(get("/api/shared/routes/abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.name").value("Feldweg"))
                .andExpect(jsonPath("$.geometry.type").value("LineString"))
                .andExpect(jsonPath("$.geometry.coordinates[0][0]").value(10.0))
                .andExpect(jsonPath("$.createdAt").doesNotExist())
                .andExpect(jsonPath("$.shareToken").doesNotExist());
    }

    @Test
    void findByShareToken_returns404WhenTokenUnknown() throws Exception {
        when(routeService.findByShareToken("missing"))
                .thenThrow(new RouteNotFoundException("missing"));

        mockMvc.perform(get("/api/shared/routes/missing"))
                .andExpect(status().isNotFound());
    }
}
