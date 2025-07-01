-- Drop function if it exists
DROP FUNCTION IF EXISTS get_promo_code_analytics();

-- Create function to get promo code analytics
CREATE FUNCTION get_promo_code_analytics()
RETURNS TABLE (
  promo_code_id UUID,
  code TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  total_bookings BIGINT,
  total_slots BIGINT,
  total_revenue NUMERIC,
  first_used TIMESTAMP,
  last_used TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.code,
    pc.discount_type,
    pc.discount_value,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.slots), 0) AS total_slots,
    COALESCE(SUM(b.total_price), 0) AS total_revenue,
    MIN(b.created_at) AS first_used,
    MAX(b.created_at) AS last_used
  FROM promo_codes pc
  LEFT JOIN tour_bookings b ON b.promo_code_id = pc.id
  GROUP BY pc.id, pc.code, pc.discount_type, pc.discount_value
  ORDER BY total_bookings DESC, pc.code;
END;
$$; 