package dev.bruenker.buurekrom.paths.repository;

import dev.bruenker.buurekrom.paths.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    Optional<Route> findByShareToken(String shareToken);
}
