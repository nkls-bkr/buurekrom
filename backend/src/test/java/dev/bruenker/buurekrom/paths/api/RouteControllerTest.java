package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.service.RouteService;
import dev.bruenker.buurekrom.paths.service.UserService;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RouteController.class)
@AutoConfigureMockMvc(addFilters = false)
class RouteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RouteService routeService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private GeoJsonConverter geoJsonConverter;

    @Test
    void share_returnsShareTokenInJsonResponse() throws Exception {
        when(routeService.getOrCreateShareToken(42L)).thenReturn("token-xyz");

        mockMvc.perform(post("/api/routes/42/share"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shareToken").value("token-xyz"));

        verify(routeService).getOrCreateShareToken(eq(42L));
    }
}
