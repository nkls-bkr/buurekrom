package dev.bruenker.buurekrom.paths.service;

import dev.bruenker.buurekrom.paths.model.Field;
import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.exception.RouteNotFoundException;
import dev.bruenker.buurekrom.paths.repository.RouteRepository;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import org.locationtech.jts.geom.LineString;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.Objects.requireNonNull;

@Service
@Transactional
public class RouteService {

    @Nonnull
    private final RouteRepository routeRepository;

    @Nonnull
    private final FieldService fieldService;

    public RouteService(
            @Nonnull final RouteRepository routeRepository,
            @Nonnull final FieldService fieldService
    ) {
        this.routeRepository = requireNonNull(routeRepository, "routeRepository");
        this.fieldService = requireNonNull(fieldService, "fieldService");
    }

    @Transactional(readOnly = true)
    @Nonnull
    public List<Route> findByFieldId(@Nonnull final Long fieldId) {
        requireNonNull(fieldId, "fieldId");

        return routeRepository.findByFieldId(fieldId);
    }

    @Nonnull
    public Route create(
            @Nonnull final Long fieldId,
            @Nullable final String name,
            @Nonnull final LineString geometry
    ) {
        requireNonNull(fieldId, "fieldId");
        requireNonNull(geometry, "geometry");

        final Field field = fieldService.findById(fieldId);
        final Route route = new Route(null, name, geometry, field, null);

        return routeRepository.save(route);
    }

    public void delete(@Nonnull final Long fieldId, @Nonnull final Long routeId) {
        requireNonNull(fieldId, "fieldId");
        requireNonNull(routeId, "routeId");

        final Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RouteNotFoundException(routeId));

        if (!route.getField().getId().equals(fieldId)) {
            throw new RouteNotFoundException(fieldId, routeId);
        }

        routeRepository.delete(route);
    }
}
