-- D1 Initial Schema Migration
-- PDF 링크공유기 데이터베이스

CREATE TABLE IF NOT EXISTS documents (
    id              TEXT PRIMARY KEY,
    share_id        TEXT UNIQUE NOT NULL,
    file_name       TEXT NOT NULL,
    file_size       INTEGER NOT NULL,
    file_type       TEXT NOT NULL DEFAULT 'pdf',
    r2_key          TEXT NOT NULL,
    allow_download  INTEGER DEFAULT 1,
    expires_at      TEXT NOT NULL,
    uploader_ip     TEXT,
    view_count      INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now')),
    deleted_at      TEXT
);

CREATE INDEX IF NOT EXISTS idx_share_id ON documents(share_id);
CREATE INDEX IF NOT EXISTS idx_expires_at ON documents(expires_at);
CREATE INDEX IF NOT EXISTS idx_uploader_ip ON documents(uploader_ip);
CREATE INDEX IF NOT EXISTS idx_deleted_at ON documents(deleted_at);
