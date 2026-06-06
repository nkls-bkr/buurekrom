package dev.bruenker.buurekrom.paths.service;

import dev.bruenker.buurekrom.paths.exception.RouteNotFoundException;
import dev.bruenker.buurekrom.paths.model.Route;
import dev.bruenker.buurekrom.paths.model.User;
import dev.bruenker.buurekrom.paths.repository.RouteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Mock
    private RouteRepository routeRepository;

    @InjectMocks
    private RouteService routeService;

    private User owner;
    private LineString geometry;

    @BeforeEach
    void setUp() {
        owner = new User(1L, "alice", "secret", null);
        geometry = GEOMETRY_FACTORY.createLineString(new Coordinate[]{
                new Coordinate(10.0, 50.0),
                new Coordinate(10.1, 50.1)
        });
    }

    @Nested
    class GetOrCreateShareToken {

        @Test
        void shouldGenerateAndPersistNewToken_whenTokenIsAbsent() {
            final Route route = new Route(42L, "Zum Acker", geometry, owner, null, null);
            when(routeRepository.findById(42L)).thenReturn(Optional.of(route));
            when(routeRepository.save(any(Route.class))).thenAnswer(inv -> inv.getArgument(0));

            final String token = routeService.getOrCreateShareToken(42L);

            assertThat(token).isNotBlank();
            assertThat(token).doesNotContain("=");
            assertThat(route.getShareToken()).isEqualTo(token);

            final ArgumentCaptor<Route> captor = ArgumentCaptor.forClass(Route.class);
            verify(routeRepository).save(captor.capture());
            assertThat(captor.getValue().getShareToken()).isEqualTo(token);
        }

        @Test
        void shouldReturnExistingTokenWithoutSaving_whenTokenAlreadyExists() {
            final Route route = new Route(42L, "Zum Acker", geometry, owner, null, "existing-token");
            when(routeRepository.findById(42L)).thenReturn(Optional.of(route));

            final String token = routeService.getOrCreateShareToken(42L);

            assertThat(token).isEqualTo("existing-token");
            verify(routeRepository, never()).save(any(Route.class));
        }

        @Test
        void shouldThrowRouteNotFoundException_whenRouteIsMissing() {
            when(routeRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> routeService.getOrCreateShareToken(99L))
                    .isInstanceOf(RouteNotFoundException.class);

            verify(routeRepository, never()).save(any(Route.class));
        }
    }

    @Nested
    class FindByShareToken {

        @Test
        void shouldReturnRoute_whenTokenMatches() {
            final Route route = new Route(7L, null, geometry, owner, null, "abc");
            when(routeRepository.findByShareToken("abc")).thenReturn(Optional.of(route));

            final Route result = routeService.findByShareToken("abc");

            assertThat(result).isSameAs(route);
        }

        @Test
        void shouldThrowRouteNotFoundException_whenTokenIsUnknown() {
            when(routeRepository.findByShareToken("nope")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> routeService.findByShareToken("nope"))
                    .isInstanceOf(RouteNotFoundException.class);
        }
    }
}
