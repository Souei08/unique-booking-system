-- Function to get user role efficiently
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE supabase_id = user_id;
    
    RETURN user_role;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;

-- Create an index on supabase_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);

-- Function to get user role with caching hint
CREATE OR REPLACE FUNCTION get_user_role_cached(user_id UUID)
RETURNS TABLE(role TEXT, cached_at TIMESTAMP)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT u.role, NOW() as cached_at
    FROM users u
    WHERE u.supabase_id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role_cached(UUID) TO authenticated; 