package dev.bruenker.buurekrom.paths.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.bruenker.buurekrom.paths.api.request.RouteRequest;
import dev.bruenker.buurekrom.paths.api.response.RouteResponse;
import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import jakarta.annotation.Nonnull;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static java.util.Objects.requireNonNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class RouteTestClient {

    @Nonnull
    private final MockMvc mockMvc;

    @Nonnull
    private final ObjectMapper objectMapper;

    @Nonnull
    private final GeoJsonConverter geoJsonConverter;

    public RouteTestClient(
            @Nonnull final MockMvc mockMvc,
            @Nonnull final ObjectMapper objectMapper,
            @Nonnull final GeoJsonConverter geoJsonConverter
    ) {
        this.mockMvc = requireNonNull(mockMvc, "mockMvc");
        this.objectMapper = requireNonNull(objectMapper, "objectMapper");
        this.geoJsonConverter = requireNonNull(geoJsonConverter, "geoJsonConverter");
    }

    @Nonnull
    public Route createRoute(@Nonnull final Route route) throws Exception {
        requireNonNull(route, "route");

        final RouteRequest request = new RouteRequest(
                route.getName(),
                geoJsonConverter.toGeoJson(route.getGeometry())
        );

        final MvcResult result = mockMvc.perform(post("/api/routes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        final RouteResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                RouteResponse.class
        );
        return fromResponse(response);
    }

    @Nonnull
    public String share(final long routeId) throws Exception {
        final MvcResult result = mockMvc.perform(post("/api/routes/" + routeId + "/share")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shareToken").isString())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("shareToken").asText();
    }

    @Nonnull
    private Route fromResponse(@Nonnull final RouteResponse response) {
        final Route route = new Route();
        route.setId(response.id());
        route.setName(response.name());
        route.setGeometry(geoJsonConverter.toLineString(response.geometry()));
        route.setCreatedAt(response.createdAt());
        return route;
    }
}
