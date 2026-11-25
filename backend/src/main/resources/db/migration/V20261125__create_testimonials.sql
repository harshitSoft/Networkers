-- Additive schema for the independent testimonial feature.
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  reference_number VARCHAR(40) NOT NULL UNIQUE,
  sender_id BIGINT NOT NULL REFERENCES users(id),
  recipient_id BIGINT NOT NULL REFERENCES users(id),
  description VARCHAR(1000) NOT NULL, experience_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', visible BOOLEAN NOT NULL DEFAULT TRUE,
  moderation_note VARCHAR(1000), moderated_at TIMESTAMP, moderated_by_id BIGINT REFERENCES users(id),
  submitted_at TIMESTAMP NOT NULL, updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_testimonial_recipient ON testimonials(recipient_id,status,submitted_at);
CREATE INDEX IF NOT EXISTS idx_testimonial_sender ON testimonials(sender_id,submitted_at);
CREATE TABLE IF NOT EXISTS testimonial_reports (
  id BIGSERIAL PRIMARY KEY,
  testimonial_id BIGINT NOT NULL REFERENCES testimonials(id),
  reporter_id BIGINT NOT NULL REFERENCES users(id),
  reason VARCHAR(1000) NOT NULL, created_at TIMESTAMP NOT NULL,
  reviewed_at TIMESTAMP, reviewed_by_id BIGINT REFERENCES users(id), resolved BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uk_testimonial_reporter UNIQUE(testimonial_id,reporter_id)
);
