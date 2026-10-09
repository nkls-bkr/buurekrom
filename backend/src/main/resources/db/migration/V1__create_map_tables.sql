CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE fields
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    geometry   GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP    NOT NULL
);

CREATE INDEX idx_fields_geometry ON fields USING GIST(geometry);

CREATE TABLE routes
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255),
    geometry   GEOMETRY(LineString, 4326) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    share_token VARCHAR(36)
);

CREATE INDEX idx_routes_geometry ON routes USING GIST(geometry);
CREATE UNIQUE INDEX idx_routes_share_token ON routes (share_token) WHERE share_token IS NOT NULL;

CREATE TABLE locations
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255),
    geometry   GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
