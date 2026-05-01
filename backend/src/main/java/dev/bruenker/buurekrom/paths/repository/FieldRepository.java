package dev.bruenker.buurekrom.paths.repository;

import dev.bruenker.buurekrom.paths.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FieldRepository extends JpaRepository<Field, Long> {
}
