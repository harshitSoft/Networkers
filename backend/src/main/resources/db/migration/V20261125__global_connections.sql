-- Additive migration for the global member connections module.
-- The idempotent startup migration in DataSeeder applies the same DDL for
-- existing deployments, which do not currently use Flyway or Liquibase.
ALTER TABLE connection ADD COLUMN IF NOT EXISTS message VARCHAR(500);
ALTER TABLE connection ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;
ALTER TABLE notification ADD COLUMN IF NOT EXISTS action_url VARCHAR(500);
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS professional_title VARCHAR(255);
ALTER TABLE business_profile ADD COLUMN IF NOT EXISTS country VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_connection_sender_status_created
  ON connection(sender_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connection_receiver_status_created
  ON connection(receiver_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_directory_name
  ON users(LOWER(full_name)) WHERE enabled = TRUE AND deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_users_directory_category
  ON users(LOWER(business_category)) WHERE enabled = TRUE AND deleted = FALSE;

-- One active pending request or accepted relationship per unordered member pair.
CREATE UNIQUE INDEX IF NOT EXISTS uk_connection_active_pair
  ON connection (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
  WHERE status IN ('PENDING', 'ACCEPTED');
