-- Create a function to handle booking creation and payment link storage
CREATE OR REPLACE FUNCTION create_booking_with_payment(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone_number text,
  p_tour_id uuid,
  p_booking_date date,
  p_selected_time time,
  p_slots integer,
  p_total_price numeric,
  p_payment_method text,
  p_payment_id text,
  p_payment_link text,
  p_products jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id uuid;
  v_customer_id uuid;
  v_result jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Get or create customer
    INSERT INTO users (email, full_name, phone_number, role)
    VALUES (p_email, p_first_name || ' ' || p_last_name, p_phone_number, 'customer')
    ON CONFLICT (email) DO UPDATE
    SET 
      full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number
    RETURNING id INTO v_customer_id;

    -- Create booking
    INSERT INTO tour_bookings (
      tour_id,
      customer_id,
      booking_date,
      selected_time,
      slots,
      total_price,
      status,
      payment_link,
      payment_method,
      payment_id,
      reference_number
    )
    VALUES (
      p_tour_id,
      v_customer_id,
      p_booking_date,
      p_selected_time,
      p_slots,
      p_total_price,
      'pending_payment',
      p_payment_link,
      p_payment_method,
      p_payment_id,
      'BK-' || to_char(nextval('booking_reference_seq'), 'FM000000')
    )
    RETURNING id INTO v_booking_id;

    -- Insert products if any
    IF p_products IS NOT NULL AND jsonb_array_length(p_products) > 0 THEN
      INSERT INTO booking_products (
        booking_id,
        product_id,
        quantity,
        unit_price
      )
      SELECT 
        v_booking_id,
        (product->>'product_id')::uuid,
        (product->>'quantity')::integer,
        (product->>'unit_price')::numeric
      FROM jsonb_array_elements(p_products) AS product;
    END IF;

    -- Prepare result
    v_result := jsonb_build_object(
      'success', true,
      'booking_id', v_booking_id,
      'customer_id', v_customer_id
    );

    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Error creating booking: %', SQLERRM;
  END;
END;
$$;

-- Create sequence for booking reference numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS booking_reference_seq;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_booking_with_payment TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_with_payment TO service_role;

-- DROP FUNCTION IF EXISTS create_full_booking_v2(
--     TEXT, TEXT, TEXT, TEXT, UUID, DATE, TIME, INTEGER, NUMERIC, TEXT, TEXT, JSON, JSON, UUID, TEXT, NUMERIC
-- );

CREATE OR REPLACE FUNCTION create_full_booking_v2(
    _first_name TEXT,
    _last_name TEXT,
    _email TEXT,
    _phone_number TEXT,
    _tour_id UUID,
    _booking_date DATE,
    _selected_time TIME,
    _slots INTEGER,
    _total_price NUMERIC,
    _payment_method TEXT,
    _payment_id TEXT,
    _products JSON,
    _slot_details JSON,
    _promo_code_id UUID DEFAULT NULL,
    _promo_code TEXT DEFAULT NULL,
    _discount_amount NUMERIC DEFAULT NULL
)
RETURNS TABLE (
    booking_id UUID,
    reference_number TEXT,
    tour_title TEXT,
    tour_rate NUMERIC,
    manage_token UUID
) AS $$
DECLARE
    _user_id UUID;
    _booking_id UUID;
    _full_name TEXT := TRIM(_first_name || ' ' || _last_name);
    _payment_status TEXT;
    _booking_status TEXT;
    _reference_prefix TEXT := 'UTR';
    _reference_number TEXT;
    _tour_title TEXT;
    _tour_rate NUMERIC;
    _manage_token UUID;
    _promo_record RECORD;
    _calculated_discount NUMERIC := 0;
    _final_price NUMERIC;
    _original_price NUMERIC;
BEGIN
    -- 1. Validate promo code if provided
    IF _promo_code_id IS NOT NULL AND _promo_code IS NOT NULL THEN
        -- Get promo code with row-level security
        SELECT * INTO _promo_record 
        FROM promo_codes 
        WHERE id = _promo_code_id 
        AND code = UPPER(_promo_code)
        AND is_active = true;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid promo code';
        END IF;
        
        -- Check if promo has expired
        IF NOW() > _promo_record.expires_at THEN
            RAISE EXCEPTION 'Promo code has expired';
        END IF;
        
        -- Check if promo has reached max uses
        IF _promo_record.times_used >= _promo_record.max_uses THEN
            RAISE EXCEPTION 'Promo code has reached maximum usage limit';
        END IF;
        
        -- Calculate the actual discount server-side
        IF _promo_record.discount_type = 'percentage' THEN
            _calculated_discount := (_total_price * _promo_record.discount_value) / 100;
        ELSE
            _calculated_discount := _promo_record.discount_value;
        END IF;
        
        -- Ensure discount doesn't exceed total amount
        _calculated_discount := LEAST(_calculated_discount, _total_price);
        
        -- Verify the provided discount amount matches our calculation
        IF _discount_amount IS NULL OR ABS(_discount_amount - _calculated_discount) > 0.01 THEN
            RAISE EXCEPTION 'Invalid discount amount';
        END IF;
        
        _original_price := _total_price;
        _final_price := _total_price - _calculated_discount;
    ELSE
        _final_price := _total_price;
        _original_price := _total_price;
    END IF;

    -- 2. Find or create user
    SELECT id INTO _user_id FROM users WHERE email = _email;

    IF _user_id IS NULL THEN
        INSERT INTO users (email, full_name, role, phone_number, created_at)
        VALUES (_email, _full_name, 'customer', _phone_number, NOW())
        RETURNING id INTO _user_id;
    END IF;

    -- 3. Determine payment and booking status
    IF LOWER(_payment_method) = 'cash' THEN
        _payment_status := 'unpaid';
        _booking_status := 'pending';
    ELSE
        _payment_status := 'pending';
        _booking_status := 'pending';
    END IF;

    -- 4. Generate reference number and manage token
    _reference_number := _reference_prefix || LPAD(NEXTVAL('booking_ref_seq')::TEXT, 4, '0');
    _manage_token := gen_random_uuid();

    -- 5. Insert booking with promo information
    INSERT INTO tour_bookings (
        tour_id,
        customer_id,
        booking_date,
        selected_time,
        slots,
        total_price,
        status,
        reference_number,
        slot_details,
        manage_token,
        promo_code_id
    )
    VALUES (
        _tour_id,
        _user_id,
        _booking_date,
        _selected_time,
        _slots,
        _final_price, -- Use the calculated final price
        _booking_status,
        _reference_number,
        _slot_details,
        _manage_token,
        _promo_code_id
    )
    RETURNING id INTO _booking_id;

    -- 6. Insert payment
    INSERT INTO payments (
        booking_id,
        payment_method,
        payment_id,
        amount_paid,
        status,
        paid_at
    )
    VALUES (
        _booking_id,
        _payment_method,
        _payment_id,
        _final_price, -- Use the calculated final price
        _payment_status,
        NULL
    );

    -- 7. Insert products
    IF _products IS NOT NULL AND jsonb_typeof(_products::jsonb) = 'array' THEN
        INSERT INTO booking_products (booking_id, product_id, quantity, unit_price)
        SELECT 
            _booking_id,
            (p->>'product_id')::UUID,
            COALESCE((p->>'quantity')::INT, 1),
            (p->>'unit_price')::NUMERIC
        FROM jsonb_array_elements(_products::jsonb) AS p;
    END IF;

    -- 8. Increment promo code usage (with proper locking to prevent race conditions)
    IF _promo_code_id IS NOT NULL THEN
        UPDATE promo_codes 
        SET times_used = times_used + 1
        WHERE id = _promo_code_id
        AND times_used < max_uses;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Promo code usage limit exceeded';
        END IF;
    END IF;

    -- 9. Get tour details
    SELECT title, rate INTO _tour_title, _tour_rate FROM tours WHERE id = _tour_id;

    -- 10. Return with explicit aliases to match RETURN TABLE
    RETURN QUERY 
    SELECT 
      _booking_id AS booking_id,
      _reference_number AS reference_number,
      _tour_title AS tour_title,
      _tour_rate AS tour_rate,
      _manage_token AS manage_token;
END;
$$ LANGUAGE plpgsql;

-- Function to reserve a promo code temporarily
CREATE OR REPLACE FUNCTION reserve_promo_code(
    p_promo_code_id UUID,
    p_promo_code TEXT
)
RETURNS JSON AS $$
DECLARE
    _promo_record RECORD;
    _reservation_id UUID;
BEGIN
    -- Get promo code with row-level security and lock it
    SELECT * INTO _promo_record 
    FROM promo_codes 
    WHERE id = p_promo_code_id 
    AND code = UPPER(p_promo_code)
    AND is_active = true
    AND times_used < max_uses
    AND NOW() <= expires_at
    FOR UPDATE SKIP LOCKED; -- This prevents race conditions
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Create a temporary reservation (optional - you can implement this if needed)
    -- For now, we'll just return the promo data
    RETURN json_build_object(
        'id', _promo_record.id,
        'code', _promo_record.code,
        'discount_type', _promo_record.discount_type,
        'discount_value', _promo_record.discount_value,
        'times_used', _promo_record.times_used,
        'max_uses', _promo_record.max_uses
    );
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on promo_codes table
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Policy for reading promo codes (only active ones)
CREATE POLICY "Allow reading active promo codes" ON promo_codes
    FOR SELECT
    USING (is_active = true);

-- Policy for admin users to manage promo codes
CREATE POLICY "Allow admin users to manage promo codes" ON promo_codes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Policy for service role to manage promo codes
CREATE POLICY "Allow service role to manage promo codes" ON promo_codes
    FOR ALL
    USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION reserve_promo_code TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_promo_code TO service_role; 