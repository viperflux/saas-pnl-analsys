-- Migration: Add authentication tables and update existing schema

-- Create users table
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

-- Add user_id column to user_sessions table
ALTER TABLE user_sessions 
ADD COLUMN user_id UUID REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Insert default admin user (password: admin123 - should be changed after first login)
-- Password hash for 'admin123' using bcrypt with 12 salt rounds
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (
    'admin@localhost.com',
    '$2b$12$le0Y3wyaMMTBc5ZdHZv0MeX1wYOKgyOc1U705NaEksX8RFoDo2G/O',
    'admin',
    'System',
    'Administrator'
);