package dev.bruenker.buurekrom.paths.model;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Polygon;

import java.time.LocalDateTime;

import static java.util.Objects.requireNonNull;

@Entity
@Table(name = "fields")
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Nullable
    private Long id;

    @Column(nullable = false)
    @Nonnull
    private String name;

    @Column(nullable = false, columnDefinition = "geometry(Polygon,4326)")
    @Nonnull
    private Polygon geometry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @Nonnull
    private User owner;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Nullable
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @Nullable
    private LocalDateTime updatedAt;

    public Field() {
    }

    public Field(
            @Nullable final Long id,
            @Nonnull final String name,
            @Nonnull final Polygon geometry,
            @Nonnull final User owner,
            @Nullable final LocalDateTime createdAt,
            @Nullable final LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = requireNonNull(name, "name");
        this.geometry = requireNonNull(geometry, "geometry");
        this.owner = requireNonNull(owner, "owner");
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @Nullable
    public Long getId() {
        return id;
    }

    public void setId(@Nullable final Long id) {
        this.id = id;
    }

    @Nonnull
    public String getName() {
        return name;
    }

    public void setName(@Nonnull final String name) {
        this.name = requireNonNull(name, "name");
    }

    @Nonnull
    public Polygon getGeometry() {
        return geometry;
    }

    public void setGeometry(@Nonnull final Polygon geometry) {
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

    @Nullable
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(@Nullable final LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
