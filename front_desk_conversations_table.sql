-- SQL script to create the front_desk_conversations table
CREATE TABLE IF NOT EXISTS front_desk_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionId" VARCHAR NOT NULL,
    "userId" VARCHAR,
    "userMessage" TEXT NOT NULL,
    "agentResponse" TEXT NOT NULL,
    "objective" VARCHAR NOT NULL,
    "targetAgent" VARCHAR NOT NULL,
    "collectedInfo" JSONB NOT NULL,
    "missingInfo" JSONB NOT NULL,
    "language" VARCHAR,
    "confidence" FLOAT,
    "emotion" VARCHAR,
    "entities" JSONB,
    "context" JSONB,
    "integrationId" VARCHAR,
    "integrationStatus" VARCHAR,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index on sessionId for faster queries
CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_session_id 
ON front_desk_conversations ("sessionId");

-- Create an index on createdAt for time-based queries
CREATE INDEX IF NOT EXISTS idx_front_desk_conversations_created_at 
ON front_desk_conversations ("createdAt");