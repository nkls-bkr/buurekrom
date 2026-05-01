CREATE TABLE locations
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255),
    geometry   GEOMETRY(Point, 4326) NOT NULL,
    owner_id   BIGINT       NOT NULL,
    created_at TIMESTAMP NOT NULL
);
