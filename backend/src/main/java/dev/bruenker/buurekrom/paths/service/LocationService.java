package dev.bruenker.buurekrom.paths.service;

import dev.bruenker.buurekrom.paths.model.Location;
import dev.bruenker.buurekrom.paths.model.User;
import dev.bruenker.buurekrom.paths.repository.LocationRepository;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.Objects.requireNonNull;

@Service
@Transactional
public class LocationService {

    @Nonnull
    private final LocationRepository locationRepository;

    public LocationService(@Nonnull final LocationRepository locationRepository) {
        this.locationRepository = requireNonNull(locationRepository, "locationRepository");
    }

    @Transactional(readOnly = true)
    @Nonnull
    public List<Location> findAll() {
        return locationRepository.findAll();
    }

    @Nonnull
    public Location create(
            @Nullable final String name,
            @Nonnull final Point geometry,
            @Nonnull final User owner
    ) {
        requireNonNull(geometry, "geometry");
        requireNonNull(owner, "owner");

        final Location location = new Location(null, name, geometry, owner, null);

        return locationRepository.save(location);
    }
}