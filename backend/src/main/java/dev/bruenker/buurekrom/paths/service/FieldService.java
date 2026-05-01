package dev.bruenker.buurekrom.paths.service;

import dev.bruenker.buurekrom.paths.exception.FieldNotFoundException;
import dev.bruenker.buurekrom.paths.model.Field;
import dev.bruenker.buurekrom.paths.repository.FieldRepository;
import dev.bruenker.buurekrom.paths.model.User;
import jakarta.annotation.Nonnull;
import org.locationtech.jts.geom.Polygon;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.Objects.requireNonNull;

@Service
@Transactional
public class FieldService {

    @Nonnull
    private final FieldRepository fieldRepository;

    public FieldService(@Nonnull final FieldRepository fieldRepository) {
        this.fieldRepository = requireNonNull(fieldRepository, "fieldRepository");
    }

    @Transactional(readOnly = true)
    @Nonnull
    public List<Field> findAll() {
        return fieldRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Nonnull
    public Field findById(@Nonnull final Long id) {
        requireNonNull(id, "id");

        return fieldRepository.findById(id)
                .orElseThrow(() -> new FieldNotFoundException(id));
    }

    @Nonnull
    public Field create(
            @Nonnull final String name,
            @Nonnull final Polygon geometry,
            @Nonnull final User owner
    ) {
        requireNonNull(name, "name");
        requireNonNull(geometry, "geometry");
        requireNonNull(owner, "owner");

        final Field field = new Field(null, name, geometry, owner, null, null);

        return fieldRepository.save(field);
    }

    @Nonnull
    public Field update(
            @Nonnull final Long id,
            @Nonnull final String name,
            @Nonnull final Polygon geometry
    ) {
        requireNonNull(id, "id");
        requireNonNull(name, "name");
        requireNonNull(geometry, "geometry");

        final Field field = findById(id);
        field.setName(name);
        field.setGeometry(geometry);
        return fieldRepository.save(field);
    }

    public void delete(@Nonnull final Long id) {
        requireNonNull(id, "id");

        if (!fieldRepository.existsById(id)) {
            throw new FieldNotFoundException(id);
        }

        fieldRepository.deleteById(id);
    }
}
