package dev.bruenker.buurekrom.paths.api;

import dev.bruenker.buurekrom.paths.api.request.FieldRequest;
import dev.bruenker.buurekrom.paths.api.response.FieldResponse;
import dev.bruenker.buurekrom.paths.model.Field;
import dev.bruenker.buurekrom.paths.model.User;
import dev.bruenker.buurekrom.paths.service.FieldService;
import dev.bruenker.buurekrom.paths.service.UserService;
import dev.bruenker.buurekrom.paths.shared.geojson.GeoJsonConverter;
import jakarta.annotation.Nonnull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

import static java.util.Objects.requireNonNull;

@RestController
@RequestMapping("/api/fields")
public class FieldController {

    @Nonnull
    private final FieldService fieldService;

    @Nonnull
    private final UserService userService;

    @Nonnull
    private final GeoJsonConverter geoJsonConverter;

    public FieldController(
            @Nonnull final FieldService fieldService,
            @Nonnull final UserService userService,
            @Nonnull final GeoJsonConverter geoJsonConverter
    ) {
        this.fieldService = requireNonNull(fieldService, "fieldService");
        this.userService = requireNonNull(userService, "userService");
        this.geoJsonConverter = requireNonNull(geoJsonConverter, "geoJsonConverter");
    }

    @GetMapping
    @Nonnull
    public List<FieldResponse> findAll() {
        return fieldService.findAll().stream()
                .map(field -> FieldResponse.from(field, geoJsonConverter))
                .toList();
    }

    @GetMapping("/{id}")
    @Nonnull
    public FieldResponse findById(@PathVariable @Nonnull final Long id) {
        return FieldResponse.from(fieldService.findById(id), geoJsonConverter);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Nonnull
    public FieldResponse create(
            @RequestBody @Nonnull final FieldRequest request,
            @Nonnull final Principal principal
    ) {
        final User owner = userService.findByUsername(principal.getName());
        final Field field = fieldService.create(
                request.name(),
                geoJsonConverter.toPolygon(request.geometry()),
                owner
        );
        return FieldResponse.from(field, geoJsonConverter);
    }

    @PutMapping("/{id}")
    @Nonnull
    public FieldResponse update(
            @PathVariable @Nonnull final Long id,
            @RequestBody @Nonnull final FieldRequest request
    ) {
        final Field field = fieldService.update(
                id,
                request.name(),
                geoJsonConverter.toPolygon(request.geometry())
        );
        return FieldResponse.from(field, geoJsonConverter);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Nonnull final Long id) {
        fieldService.delete(id);
    }
}
