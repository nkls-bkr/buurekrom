package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.api.response.SharedRouteResponse;
import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.service.RouteService;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import jakarta.annotation.Nonnull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.util.Objects.requireNonNull;

@RestController
@RequestMapping("/api/shared/routes")
public class SharedRouteController {

    @Nonnull
    private final RouteService routeService;

    @Nonnull
    private final GeoJsonConverter geoJsonConverter;

    public SharedRouteController(
            @Nonnull final RouteService routeService,
            @Nonnull final GeoJsonConverter geoJsonConverter
    ) {
        this.routeService = requireNonNull(routeService, "routeService");
        this.geoJsonConverter = requireNonNull(geoJsonConverter, "geoJsonConverter");
    }

    @GetMapping("/{shareToken}")
    @Nonnull
    public SharedRouteResponse findByShareToken(@PathVariable @Nonnull final String shareToken) {
        final Route route = routeService.findByShareToken(shareToken);
        return SharedRouteResponse.from(route, geoJsonConverter);
    }
}
