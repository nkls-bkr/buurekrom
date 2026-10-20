package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.service.RouteService;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonLineString;
import dev.bruenker.buurekrom.paths.shared.geojson.InvalidGeoJsonException;
import dev.bruenker.buurekrom.paths.exception.RouteNotFoundException;
import dev.bruenker.buurekrom.paths.model.Route;
import org.springframework.http.MediaType;
import org.locationtech.jts.geom.LineString;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RouteController.class)
@AutoConfigureMockMvc(addFilters = false)
class RouteControllerTest {
    private static final String UPDATE_BODY = """
            {"name":"Neu","geometry":{"type":"LineString","coordinates":[[10,50],[11,51]]}}
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RouteService routeService;

    @MockitoBean
    private GeoJsonConverter geoJsonConverter;

    @Test
    void update_returnsExistingRouteWithNewGeometry() throws Exception {
        final GeoJsonConverter converter = new GeoJsonConverter();
        final GeoJsonLineString json = new GeoJsonLineString(List.of(
                List.of(10.0, 50.0), List.of(11.0, 51.0)));
        final LineString geometry = converter.toLineString(json);
        when(geoJsonConverter.toLineString(any())).thenReturn(geometry);
        when(geoJsonConverter.toGeoJson(geometry)).thenReturn(json);
        when(routeService.update(42L, "Neu", geometry))
                .thenReturn(new Route(42L, "Neu", geometry, null, "unchanged"));

        mockMvc.perform(put("/api/routes/42").contentType(MediaType.APPLICATION_JSON).content(UPDATE_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Neu"))
                .andExpect(jsonPath("$.geometry.coordinates[1][0]").value(11));
    }

    @Test
    void update_returnsNotFoundForMissingRoute() throws Exception {
        when(routeService.update(eq(99L), eq("Neu"), any()))
                .thenThrow(new RouteNotFoundException(99L));
        mockMvc.perform(put("/api/routes/99").contentType(MediaType.APPLICATION_JSON).content(UPDATE_BODY))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_rejectsInvalidGeometryBeforeSaving() throws Exception {
        when(geoJsonConverter.toLineString(any())).thenThrow(new InvalidGeoJsonException("Invalid route"));
        mockMvc.perform(put("/api/routes/42").contentType(MediaType.APPLICATION_JSON).content(UPDATE_BODY))
                .andExpect(status().isBadRequest());
        verify(routeService, never()).update(any(), any(), any());
    }

    @Test
    void share_returnsShareTokenInJsonResponse() throws Exception {
        when(routeService.getOrCreateShareToken(42L)).thenReturn("token-xyz");

        mockMvc.perform(post("/api/routes/42/share"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shareToken").value("token-xyz"));

        verify(routeService).getOrCreateShareToken(eq(42L));
    }
}
