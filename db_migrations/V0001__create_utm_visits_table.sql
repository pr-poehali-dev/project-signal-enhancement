CREATE TABLE IF NOT EXISTS utm_visits (
    id SERIAL PRIMARY KEY,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    referrer TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utm_visits_created_at ON utm_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_utm_visits_utm_source ON utm_visits(utm_source);
