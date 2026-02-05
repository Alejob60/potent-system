-- Meta-Agent V2 Database Migration
-- PostgreSQL 14+
-- Run this migration after infrastructure provisioning

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Create function to get current tenant from app setting
CREATE OR REPLACE FUNCTION get_current_tenant_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', TRUE);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SESSION CONTEXTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS session_contexts_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    channel VARCHAR(50) NOT NULL,
    short_context JSONB NOT NULL DEFAULT '{
        "summary": "",
        "lastIntent": "unknown",
        "entities": {},
        "conversationState": "greeting"
    }'::jsonb,
    recent_turns JSONB NOT NULL DEFAULT '[]'::jsonb,
    turn_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes
CREATE UNIQUE INDEX idx_session_contexts_v2_tenant_session 
    ON session_contexts_v2(tenant_id, session_id);

CREATE INDEX idx_session_contexts_v2_session_id 
    ON session_contexts_v2(session_id);

CREATE INDEX idx_session_contexts_v2_tenant_id 
    ON session_contexts_v2(tenant_id);

CREATE INDEX idx_session_contexts_v2_tenant_updated 
    ON session_contexts_v2(tenant_id, updated_at DESC);

CREATE INDEX idx_session_contexts_v2_expires_at 
    ON session_contexts_v2(expires_at) 
    WHERE expires_at IS NOT NULL AND is_active = TRUE;

-- Enable RLS
ALTER TABLE session_contexts_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY tenant_isolation_policy_session_contexts 
    ON session_contexts_v2
    USING (tenant_id = get_current_tenant_id());

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_contexts_v2_updated_at
    BEFORE UPDATE ON session_contexts_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONVERSATION TURNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS conversation_turns_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    correlation_id VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'agent')),
    text TEXT NOT NULL,
    actions JSONB,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    turn_number INTEGER
);

-- Indexes
CREATE INDEX idx_conversation_turns_v2_session_timestamp 
    ON conversation_turns_v2(session_id, timestamp DESC);

CREATE INDEX idx_conversation_turns_v2_tenant_timestamp 
    ON conversation_turns_v2(tenant_id, timestamp DESC);

CREATE INDEX idx_conversation_turns_v2_correlation_id 
    ON conversation_turns_v2(correlation_id);

CREATE INDEX idx_conversation_turns_v2_tenant_id 
    ON conversation_turns_v2(tenant_id);

-- Enable RLS
ALTER TABLE conversation_turns_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY tenant_isolation_policy_conversation_turns 
    ON conversation_turns_v2
    USING (tenant_id = get_current_tenant_id());

-- ============================================
-- USER CONSENTS TABLE (for voice recordings)
-- ============================================

CREATE TABLE IF NOT EXISTS user_consents_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    voice_recording_consent BOOLEAN NOT NULL DEFAULT FALSE,
    data_learning_consent BOOLEAN NOT NULL DEFAULT FALSE,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_date TIMESTAMPTZ,
    metadata JSONB
);

-- Indexes
CREATE UNIQUE INDEX idx_user_consents_v2_user_tenant 
    ON user_consents_v2(user_id, tenant_id);

CREATE INDEX idx_user_consents_v2_tenant_id 
    ON user_consents_v2(tenant_id);

-- Enable RLS
ALTER TABLE user_consents_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY tenant_isolation_policy_user_consents 
    ON user_consents_v2
    USING (tenant_id = get_current_tenant_id());

-- ============================================
-- AUDIT LOGS TABLE (immutable)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    correlation_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_v2_tenant_timestamp 
    ON audit_logs_v2(tenant_id, timestamp DESC);

CREATE INDEX idx_audit_logs_v2_correlation_id 
    ON audit_logs_v2(correlation_id);

CREATE INDEX idx_audit_logs_v2_action 
    ON audit_logs_v2(action);

-- Enable RLS
ALTER TABLE audit_logs_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policy (read-only for tenant)
CREATE POLICY tenant_isolation_policy_audit_logs 
    ON audit_logs_v2
    FOR SELECT
    USING (tenant_id = get_current_tenant_id());

-- Prevent updates/deletes (immutable)
CREATE POLICY prevent_audit_logs_modification 
    ON audit_logs_v2
    FOR UPDATE
    USING (FALSE);

CREATE POLICY prevent_audit_logs_deletion 
    ON audit_logs_v2
    FOR DELETE
    USING (FALSE);

-- ============================================
-- TOKEN USAGE TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS token_usage_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    model VARCHAR(100) NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    requests_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_token_usage_v2_tenant_date_model 
    ON token_usage_v2(tenant_id, date, model);

CREATE INDEX idx_token_usage_v2_tenant_id 
    ON token_usage_v2(tenant_id);

CREATE INDEX idx_token_usage_v2_date 
    ON token_usage_v2(date DESC);

-- Enable RLS
ALTER TABLE token_usage_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY tenant_isolation_policy_token_usage 
    ON token_usage_v2
    USING (tenant_id = get_current_tenant_id());

-- Auto-update trigger
CREATE TRIGGER update_token_usage_v2_updated_at
    BEFORE UPDATE ON token_usage_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VOICE RECORDINGS METADATA TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_recordings_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    blob_url TEXT NOT NULL,
    duration_seconds INTEGER,
    transcript TEXT,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB
);

-- Indexes
CREATE INDEX idx_voice_recordings_v2_session_id 
    ON voice_recordings_v2(session_id);

CREATE INDEX idx_voice_recordings_v2_tenant_id 
    ON voice_recordings_v2(tenant_id);

CREATE INDEX idx_voice_recordings_v2_user_id 
    ON voice_recordings_v2(user_id);

CREATE INDEX idx_voice_recordings_v2_expires_at 
    ON voice_recordings_v2(expires_at) 
    WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE voice_recordings_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY tenant_isolation_policy_voice_recordings 
    ON voice_recordings_v2
    USING (tenant_id = get_current_tenant_id());

-- ============================================
-- CLEANUP EXPIRED SESSIONS (scheduled job)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM session_contexts_v2
    WHERE expires_at IS NOT NULL 
      AND expires_at < NOW()
      AND is_active = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule: Run daily via cron or Azure Function

-- ============================================
-- CLEANUP EXPIRED RECORDINGS (scheduled job)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_recordings()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete metadata (blobs deleted via lifecycle policy)
    DELETE FROM voice_recordings_v2
    WHERE expires_at IS NOT NULL 
      AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get session summary
CREATE OR REPLACE FUNCTION get_session_summary_v2(
    p_session_id VARCHAR,
    p_tenant_id VARCHAR
)
RETURNS TABLE(
    session_id VARCHAR,
    tenant_id VARCHAR,
    user_id VARCHAR,
    channel VARCHAR,
    state VARCHAR,
    last_intent VARCHAR,
    total_turns BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.session_id,
        sc.tenant_id,
        sc.user_id,
        sc.channel,
        sc.short_context->>'conversationState' AS state,
        sc.short_context->>'lastIntent' AS last_intent,
        COUNT(ct.id) AS total_turns,
        sc.created_at,
        sc.updated_at,
        sc.is_active
    FROM session_contexts_v2 sc
    LEFT JOIN conversation_turns_v2 ct 
        ON ct.session_id = sc.session_id 
        AND ct.tenant_id = sc.tenant_id
    WHERE sc.session_id = p_session_id
      AND sc.tenant_id = p_tenant_id
    GROUP BY sc.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANTS (adjust according to your user)
-- ============================================

-- Grant permissions to application user (replace 'metaagent_app' with your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO metaagent_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO metaagent_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO metaagent_app;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Insert migration record
INSERT INTO migrations (name, executed_at)
VALUES ('meta_agent_v2_initial', NOW())
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Meta-Agent V2 migration completed successfully!';
    RAISE NOTICE 'Tables created: session_contexts_v2, conversation_turns_v2, user_consents_v2, audit_logs_v2, token_usage_v2, voice_recordings_v2';
    RAISE NOTICE 'RLS enabled on all tables with tenant isolation policies';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run TypeORM synchronize or verify entity mappings';
    RAISE NOTICE '2. Create application user and grant permissions';
    RAISE NOTICE '3. Test RLS policies with SET app.current_tenant_id';
END $$;
