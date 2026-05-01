package dev.bruenker.buurekrom.paths.model;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static java.util.Objects.requireNonNull;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Nullable
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    @Nonnull
    private String username;

    @Column(nullable = false)
    @Nonnull
    private String password;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @Nullable
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @Nonnull
    private final Set<Field> fields = new HashSet<>();

    // Nur für JPA - Hibernate überschreibt finale Felder via Reflection
    protected User() {
    }

    public User(
            @Nullable final Long id,
            @Nonnull final String username,
            @Nonnull final String password,
            @Nullable final LocalDateTime createdAt
    ) {
        this.id = id;
        this.username = requireNonNull(username, "username");
        this.password = requireNonNull(password, "password");
        this.createdAt = createdAt;
    }

    @Nullable
    public Long getId() {
        return id;
    }

    public void setId(@Nullable Long id) {
        this.id = id;
    }

    @Nonnull
    public String getUsername() {
        return username;
    }

    @Nonnull
    public String getPassword() {
        return password;
    }

    public void setPassword(@Nonnull String password) {
        this.password = requireNonNull(password, "password");
    }

    @Nullable
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(@Nullable LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Nonnull
    public Set<Field> getFields() {
        return fields;
    }
}
