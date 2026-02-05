-- Script SQL para crear las tablas necesarias para los agentes

-- Crear tabla agent_trend_scans
CREATE TABLE IF NOT EXISTS "agent_trend_scans" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "topic" character varying NOT NULL,
  "trends" jsonb,
  "platform" character varying,
  "sessionId" character varying,
  "userId" character varying,
  "status" character varying DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla agent_analytics_reporters
CREATE TABLE IF NOT EXISTS "agent_analytics_reporters" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "metric" character varying NOT NULL,
  "period" character varying NOT NULL,
  "reportData" jsonb,
  "sessionId" character varying,
  "userId" character varying,
  "status" character varying DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla viral_campaigns
CREATE TABLE IF NOT EXISTS "viral_campaigns" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "campaignName" character varying NOT NULL,
  "objective" character varying NOT NULL,
  "targetAudience" character varying NOT NULL,
  "budget" integer NOT NULL,
  "durationDays" integer NOT NULL,
  "platforms" jsonb NOT NULL,
  "details" jsonb,
  "sessionId" character varying,
  "userId" character varying,
  "status" character varying DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar que las tablas se hayan creado correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agent_trend_scans', 'agent_analytics_reporters', 'viral_campaigns')
ORDER BY table_name;