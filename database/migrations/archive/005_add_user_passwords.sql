-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Update existing users with default passwords (hashed with bcrypt, cost factor: 12)
-- qAdmin (bootstrap account): admin123
UPDATE users SET password_hash = '$2b$12$SjkgsTQA0fR2Wgep.ZOo0OTg2z9ZKgaiV9IVbD.Z1JpAAQ6uc05Ae' WHERE email = 'qadmin@sim-rq.local';

-- Alice (End-User): user123
UPDATE users SET password_hash = '$2b$12$FhfkigL6Hans3oKrIUZffuRIjkrP6JnWLzpZUbF0J0uSzvpKzr4OC' WHERE email = 'alice@sim-rq.local';

-- Bob (Manager): manager123
UPDATE users SET password_hash = '$2b$12$Pfeu0imhApEo2lG1NeTWZ.EGn6VKvHAtLOvL/heACYfIogysUWS9C' WHERE email = 'bob@sim-rq.local';

-- Charlie (Engineer): engineer123
UPDATE users SET password_hash = '$2b$12$FLTxH1QvYc7d0d.f1l7VnePQ7n7vHiAjtMY98tWEN.l2sNDwAv2U6' WHERE email = 'charlie@sim-rq.local';

-- Make password_hash required for new users
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
