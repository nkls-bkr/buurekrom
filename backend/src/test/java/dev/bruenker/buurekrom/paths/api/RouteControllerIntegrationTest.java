package dev.bruenker.buurekrom.paths.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import dev.bruenker.buurekrom.paths.support.BuurekromIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static dev.bruenker.buurekrom.paths.api.RouteFixtures.aRoute;
import static org.assertj.core.api.Assertions.*;

class RouteControllerIntegrationTest extends BuurekromIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GeoJsonConverter geoJsonConverter;

    private RouteTestClient routes;

    @BeforeEach
    void setUp() {
        routes = new RouteTestClient(mockMvc, objectMapper, geoJsonConverter);
    }

    @Test
    @WithMockUser(TEST_USERNAME)
    void shouldReturnShareToken_whenAllConditionsAreMet() throws Exception {
        final Route route = aRoute().build();

        final Route created = routes.createRoute(route);

        final String firstToken = routes.share(created.getId());
        assertThatNoException().isThrownBy(() -> UUID.fromString(firstToken));
    }
}
