ALTER TABLE routes ADD COLUMN share_token VARCHAR(36);

CREATE UNIQUE INDEX idx_routes_share_token ON routes (share_token) WHERE share_token IS NOT NULL;
