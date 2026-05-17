package dev.bruenker.buurekrom.paths.model;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.LineString;

import java.time.LocalDateTime;

import static java.util.Objects.requireNonNull;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Nullable
    private Long id;

    @Column
    @Nullable
    private String name;

    @Column(nullable = false, columnDefinition = "geometry(LineString,4326)")
    @Nonnull
    private LineString geometry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @Nonnull
    private User owner;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Nullable
    private LocalDateTime createdAt;

    public Route() {
    }

    public Route(
            @Nullable final Long id,
            @Nullable final String name,
            @Nonnull final LineString geometry,
            @Nonnull final User owner,
            @Nullable final LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.geometry = requireNonNull(geometry, "geometry");
        this.owner = requireNonNull(owner, "owner");
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
    public LineString getGeometry() {
        return geometry;
    }

    public void setGeometry(@Nonnull final LineString geometry) {
        this.geometry = requireNonNull(geometry, "geometry");
    }

    @Nonnull
    public User getOwner() {
        return owner;
    }

    public void setOwner(@Nonnull final User owner) {
        this.owner = requireNonNull(owner, "owner");
    }

    @Nullable
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(@Nullable final LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
