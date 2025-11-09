-- Periscope Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forecasters table
CREATE TABLE IF NOT EXISTS forecaster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    platform VARCHAR(50), -- 'twitter', 'youtube', 'rss', 'manual'
    bio TEXT,
    avatar_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, platform)
);

-- Sources table
CREATE TABLE IF NOT EXISTS source (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecaster_id UUID REFERENCES forecaster(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    title TEXT,
    content TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url)
);

-- Claims table
CREATE TABLE IF NOT EXISTS claim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecaster_id UUID REFERENCES forecaster(id) ON DELETE SET NULL,
    source_id UUID REFERENCES source(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    domain VARCHAR(50) NOT NULL, -- 'economy', 'politics', 'technology', 'earthquakes'
    predicted_value NUMERIC,
    predicted_category VARCHAR(255),
    predicted_probability NUMERIC CHECK (predicted_probability >= 0 AND predicted_probability <= 1),
    claim_type VARCHAR(50) NOT NULL, -- 'numeric', 'categorical', 'probabilistic'
    deadline_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved', 'expired', 'invalid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Outcomes table
CREATE TABLE IF NOT EXISTS outcome (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claim(id) ON DELETE CASCADE,
    actual_value NUMERIC,
    actual_category VARCHAR(255),
    actual_probability NUMERIC CHECK (actual_probability >= 0 AND actual_probability <= 1),
    perimeter_score NUMERIC CHECK (perimeter_score >= 0 AND perimeter_score <= 100),
    data_source TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(claim_id)
);

-- Claim tags table
CREATE TABLE IF NOT EXISTS claim_tag (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claim(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    tag_type VARCHAR(50), -- 'keyword', 'topic', 'region', 'entity'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(claim_id, tag)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claim_forecaster ON claim(forecaster_id);
CREATE INDEX IF NOT EXISTS idx_claim_domain ON claim(domain);
CREATE INDEX IF NOT EXISTS idx_claim_status ON claim(status);
CREATE INDEX IF NOT EXISTS idx_claim_created_at ON claim(created_at);
CREATE INDEX IF NOT EXISTS idx_outcome_claim ON outcome(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_tag_claim ON claim_tag(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_tag_tag ON claim_tag(tag);
CREATE INDEX IF NOT EXISTS idx_source_forecaster ON source(forecaster_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_forecaster_updated_at BEFORE UPDATE ON forecaster
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_updated_at BEFORE UPDATE ON claim
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

