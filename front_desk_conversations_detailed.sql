-- SQL script to create the front_desk_conversations table with exact structure matching the entity
-- This script creates the table with all columns and appropriate data types

CREATE TABLE IF NOT EXISTS front_desk_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sessionId VARCHAR NOT NULL,
    userId VARCHAR,
    userMessage TEXT NOT NULL,
    agentResponse TEXT NOT NULL,
    objective VARCHAR NOT NULL,
    targetAgent VARCHAR NOT NULL,
    collectedInfo JSONB NOT NULL,
    missingInfo JSONB NOT NULL,
    language VARCHAR,
    confidence FLOAT,
    emotion VARCHAR,
    entities JSONB,
    context JSONB,
    integrationId VARCHAR,
    integrationStatus VARCHAR,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_session_id 
ON front_desk_conversations (sessionId);

CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_created_at 
ON front_desk_conversations (createdAt);

CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_objective 
ON front_desk_conversations (objective);

CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_target_agent 
ON front_desk_conversations (targetAgent);

-- Add a trigger to automatically update the updatedAt column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_front_desk_conversations_updated_at 
BEFORE UPDATE ON front_desk_conversations 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add a comment to describe the table
COMMENT ON TABLE front_desk_conversations IS 'Stores conversation history for the Front Desk agent';