package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.api.request.RouteRequest;
import dev.bruenker.buurekrom.paths.api.response.RouteResponse;
import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.model.User;
import dev.bruenker.buurekrom.paths.service.RouteService;
import dev.bruenker.buurekrom.paths.service.UserService;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import jakarta.annotation.Nonnull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

import static java.util.Objects.requireNonNull;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Nonnull
    private final RouteService routeService;

    @Nonnull
    private final UserService userService;

    @Nonnull
    private final GeoJsonConverter geoJsonConverter;

    public RouteController(
            @Nonnull final RouteService routeService,
            @Nonnull final UserService userService,
            @Nonnull final GeoJsonConverter geoJsonConverter
    ) {
        this.routeService = requireNonNull(routeService, "routeService");
        this.userService = requireNonNull(userService, "userService");
        this.geoJsonConverter = requireNonNull(geoJsonConverter, "geoJsonConverter");
    }

    @GetMapping
    @Nonnull
    public List<RouteResponse> findAll() {
        return routeService.findAll().stream()
                .map(route -> RouteResponse.from(route, geoJsonConverter))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Nonnull
    public RouteResponse create(
            @RequestBody @Nonnull final RouteRequest request,
            @Nonnull final Principal principal
    ) {
        final User owner = userService.findByUsername(principal.getName());
        final Route route = routeService.create(
                request.name(),
                geoJsonConverter.toLineString(request.geometry()),
                owner
        );
        return RouteResponse.from(route, geoJsonConverter);
    }

    @DeleteMapping("/{routeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Nonnull final Long routeId) {
        routeService.delete(routeId);
    }
}
