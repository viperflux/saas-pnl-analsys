-- Create tables for the SaaS Cash Flow & P&L Analyzer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id),
    current_config_id UUID REFERENCES configurations(id),
    last_accessed TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_configurations_is_default ON configurations(is_default);
CREATE INDEX idx_configurations_updated_at ON configurations(updated_at);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_accessed ON user_sessions(last_accessed);

-- Insert default admin user (password: admin123 - should be changed after first login)
-- Password hash for 'admin123' using bcrypt with 12 salt rounds
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (
    'latif@desinabl.com',
    '$2b$12$iHncZ76nWAnnWfgZWPPuX.27OGQdjolQ9S6e8OGS0QrFhIB.zsnPG',
    'admin',
    'Deuce',
    'Rabbit'
);

-- Insert default configuration
INSERT INTO configurations (name, description, is_default, config) VALUES (
    'Default Configuration',
    'Default SaaS financial configuration with sample data',
    true,
    '{
        "startingCash": 0,
        "startDate": "2025-06-01",
        "pricePerClient": 49,
        "churnRate": 0.03,
        "monthlyFixedCosts": {
            "infra": 1588.60,
            "salary": 3000,
            "support": 500,
            "wages": 1000,
            "hosting": 1600
        },
        "openAiCostPerClient": 5,
        "capitalPurchases": [2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "seasonalGrowth": [8, 10, 12, 5, 6, 7, 10, 12, 8, 5, 4, 3],
        "initialClients": 5
    }'
);