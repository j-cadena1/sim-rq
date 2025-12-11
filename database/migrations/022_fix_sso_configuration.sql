-- Migration 022: Fix SSO configuration schema alignment
-- Adds missing columns and ensures initial row exists for fresh deployments
-- without SSO configured via environment variables

-- Add missing columns to sso_configuration table
ALTER TABLE sso_configuration ADD COLUMN IF NOT EXISTS redirect_uri VARCHAR(512);
ALTER TABLE sso_configuration ADD COLUMN IF NOT EXISTS authority VARCHAR(512);
ALTER TABLE sso_configuration ADD COLUMN IF NOT EXISTS scopes TEXT DEFAULT 'openid,profile,email';
ALTER TABLE sso_configuration ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Insert initial row if table is empty (prevents 404 on Settings page)
INSERT INTO sso_configuration (enabled, scopes)
SELECT false, 'openid,profile,email'
WHERE NOT EXISTS (SELECT 1 FROM sso_configuration);

-- Update existing rows to have default scopes if null
UPDATE sso_configuration SET scopes = 'openid,profile,email' WHERE scopes IS NULL;

-- Verify migration success
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sso_configuration' AND column_name = 'redirect_uri'
    ) THEN
        RAISE NOTICE 'Migration 022: SSO configuration schema aligned successfully';
    ELSE
        RAISE EXCEPTION 'Migration 022: Failed to add redirect_uri column';
    END IF;
END $$;
