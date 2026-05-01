CREATE
EXTENSION IF NOT EXISTS postgis;

CREATE TABLE fields
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    geometry   GEOMETRY(Polygon, 4326) NOT NULL,
    owner_id   BIGINT       NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP    NOT NULL,
    CONSTRAINT fk_fields_owner FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE INDEX idx_fields_geometry ON fields USING GIST(geometry);
CREATE INDEX idx_fields_owner ON fields (owner_id);
