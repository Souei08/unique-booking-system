CREATE OR REPLACE FUNCTION get_promo_codes(
    _limit INT,
    _offset INT,
    _search_text TEXT DEFAULT NULL,
    _status_filter TEXT DEFAULT NULL,
    _discount_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    code TEXT,
    discount_value NUMERIC,
    discount_type TEXT,
    status TEXT,
    usage_count INT,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    max_uses INT,
    times_used INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pc.id,
        pc.code,
        pc.discount_value,
        pc.discount_type,
        CASE
            WHEN pc.expires_at < NOW() THEN 'expired'
            ELSE 'active'
        END AS status,
        COALESCE(pc.times_used, 0) AS usage_count,
        pc.created_at,
        pc.expires_at,
        pc.max_uses,
        pc.times_used
    FROM promo_codes pc
    WHERE
        (_search_text IS NULL OR pc.code ILIKE '%' || _search_text || '%')
        AND (_status_filter IS NULL OR 
             (_status_filter = 'active' AND pc.expires_at >= NOW()) OR
             (_status_filter = 'expired' AND pc.expires_at < NOW())
            )
        AND (_discount_type_filter IS NULL OR pc.discount_type = _discount_type_filter)
    ORDER BY pc.created_at DESC
    LIMIT _limit
    OFFSET _offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 