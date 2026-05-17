package dev.bruenker.buurekrom.paths.service;

import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.model.User;
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

    public RouteService(@Nonnull final RouteRepository routeRepository) {
        this.routeRepository = requireNonNull(routeRepository, "routeRepository");
    }

    @Transactional(readOnly = true)
    @Nonnull
    public List<Route> findAll() {
        return routeRepository.findAll();
    }

    @Nonnull
    public Route create(
            @Nullable final String name,
            @Nonnull final LineString geometry,
            @Nonnull final User owner
    ) {
        requireNonNull(geometry, "geometry");
        requireNonNull(owner, "owner");

        final Route route = new Route(null, name, geometry, owner, null);

        return routeRepository.save(route);
    }

    public void delete(@Nonnull final Long routeId) {
        requireNonNull(routeId, "routeId");

        if (!routeRepository.existsById(routeId)) {
            throw new RouteNotFoundException(routeId);
        }

        routeRepository.deleteById(routeId);
    }
}
