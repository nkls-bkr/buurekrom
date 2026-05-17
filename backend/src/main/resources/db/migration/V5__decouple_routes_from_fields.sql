ALTER TABLE routes
    ADD COLUMN owner_id BIGINT;

UPDATE routes
SET owner_id = (SELECT owner_id FROM fields WHERE fields.id = routes.field_id);

ALTER TABLE routes
    ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE routes
    ADD CONSTRAINT fk_routes_owner FOREIGN KEY (owner_id) REFERENCES users (id);

CREATE INDEX idx_routes_owner ON routes (owner_id);

ALTER TABLE routes
    DROP CONSTRAINT fk_routes_field;

DROP INDEX idx_routes_field;

ALTER TABLE routes
    DROP COLUMN field_id;
