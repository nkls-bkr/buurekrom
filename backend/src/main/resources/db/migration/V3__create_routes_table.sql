CREATE TABLE routes
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255),
    geometry   GEOMETRY(LineString, 4326) NOT NULL,
    field_id   BIGINT    NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_routes_field FOREIGN KEY (field_id) REFERENCES fields (id)
);

CREATE INDEX idx_routes_geometry ON routes USING GIST(geometry);
CREATE INDEX idx_routes_field ON routes (field_id);
