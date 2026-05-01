package dev.bruenker.buurekrom.paths.repository;

import dev.bruenker.buurekrom.paths.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
}
