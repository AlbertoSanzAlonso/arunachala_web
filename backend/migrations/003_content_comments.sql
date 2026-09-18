-- Migration 003: Content comments with moderation
-- Run this against the app Postgres (arunachala_web)

CREATE TABLE IF NOT EXISTS content_comments (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    author_name VARCHAR(80) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    ip_address VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_content_comments_id ON content_comments(id);
CREATE INDEX IF NOT EXISTS ix_content_comments_content_id ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS ix_content_comments_status ON content_comments(status);
CREATE INDEX IF NOT EXISTS ix_content_comments_created_at ON content_comments(created_at);
