package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.api.request.RouteRequest;
import dev.bruenker.buurekrom.paths.api.response.RouteResponse;
import dev.bruenker.buurekrom.paths.service.RouteService;
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

import java.util.List;

import static java.util.Objects.requireNonNull;

@RestController
@RequestMapping("/api/fields/{fieldId}/routes")
public class RouteController {

    @Nonnull
    private final RouteService routeService;

    @Nonnull
    private final GeoJsonConverter geoJsonConverter;

    public RouteController(
            @Nonnull final RouteService routeService,
            @Nonnull final GeoJsonConverter geoJsonConverter
    ) {
        this.routeService = requireNonNull(routeService, "routeService");
        this.geoJsonConverter = requireNonNull(geoJsonConverter, "geoJsonConverter");
    }

    @GetMapping
    @Nonnull
    public List<RouteResponse> findByField(@PathVariable @Nonnull final Long fieldId) {
        return routeService.findByFieldId(fieldId).stream()
                .map(route -> RouteResponse.from(route, geoJsonConverter))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Nonnull
    public RouteResponse create(
            @PathVariable @Nonnull final Long fieldId,
            @RequestBody @Nonnull final RouteRequest request
    ) {
        final Route route = routeService.create(
                fieldId,
                request.name(),
                geoJsonConverter.toLineString(request.geometry())
        );
        return RouteResponse.from(route, geoJsonConverter);
    }

    @DeleteMapping("/{routeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable @Nonnull final Long fieldId,
            @PathVariable @Nonnull final Long routeId
    ) {
        routeService.delete(fieldId, routeId);
    }
}
