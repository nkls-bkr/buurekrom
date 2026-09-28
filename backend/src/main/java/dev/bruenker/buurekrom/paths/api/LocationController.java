package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.api.request.LocationRequest;
import dev.bruenker.buurekrom.paths.api.response.LocationResponse;
import dev.bruenker.buurekrom.paths.model.Location;
import dev.bruenker.buurekrom.paths.service.LocationService;
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
@RequestMapping("/api/locations")
public class LocationController {

    @Nonnull
    private final LocationService locationService;

    @Nonnull
    private final GeoJsonConverter geoJsonConverter;

    public LocationController(
            @Nonnull final LocationService locationService,
            @Nonnull final GeoJsonConverter geoJsonConverter
    ) {
        this.locationService = requireNonNull(locationService, "locationService");
        this.geoJsonConverter = requireNonNull(geoJsonConverter, "geoJsonConverter");
    }

    @GetMapping
    @Nonnull
    public List<LocationResponse> findAll() {
        return locationService.findAll().stream()
                .map(location -> LocationResponse.from(location, geoJsonConverter))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Nonnull
    public LocationResponse create(
            @RequestBody @Nonnull final LocationRequest request
    ) {
        final Location location = locationService.create(
                request.name(),
                geoJsonConverter.toPoint(request.geometry())
        );
        return LocationResponse.from(location, geoJsonConverter);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Nonnull final Long id) {
        locationService.delete(id);
    }
}