package dev.bruenker.buurekrom.paths.model;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;

import static java.util.Objects.requireNonNull;

@Entity
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Nullable
    private Long id;

    @Column
    @Nullable
    private String name;

    @Column(nullable = false, columnDefinition = "geometry(Point,4326)")
    @Nonnull
    private Point geometry;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Nullable
    private LocalDateTime createdAt;

    public Location() {
    }

    public Location(
            @Nullable final Long id,
            @Nullable final String name,
            @Nonnull final Point geometry,
            @Nullable final LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.geometry = requireNonNull(geometry, "geometry");
        this.createdAt = createdAt;
    }

    @Nullable
    public Long getId() {
        return id;
    }

    public void setId(@Nullable final Long id) {
        this.id = id;
    }

    @Nullable
    public String getName() {
        return name;
    }

    public void setName(@Nullable final String name) {
        this.name = name;
    }

    @Nonnull
    public Point getGeometry() {
        return geometry;
    }

    public void setGeometry(@Nonnull final Point geometry) {
        this.geometry = requireNonNull(geometry, "geometry");
    }

    @Nullable
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(@Nullable final LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
