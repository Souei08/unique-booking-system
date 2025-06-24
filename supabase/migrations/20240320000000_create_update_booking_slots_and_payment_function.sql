-- Create a function to update booking slots and payment amount in a transaction
CREATE OR REPLACE FUNCTION update_booking_slots_and_payment(
  p_booking_id UUID,
  p_new_slots INTEGER,
  p_new_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Update tour_bookings table
    UPDATE "tour_bookings"
    SET "slots" = p_new_slots
    WHERE "id" = p_booking_id;

    -- Update payments table
    UPDATE "payments"
    SET "amount_paid" = p_new_amount
    WHERE "booking_id" = p_booking_id;

    -- If we get here, both updates were successful
    -- The transaction will automatically commit
  EXCEPTION
    WHEN OTHERS THEN
      -- If any error occurs, roll back the transaction
      RAISE EXCEPTION 'Failed to update booking slots and payment: %', SQLERRM;
  END;
END;
$$;

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

-- Update create_full_booking_v2 function to handle promo codes
CREATE OR REPLACE FUNCTION create_full_booking_v2(
  _first_name text,
  _last_name text,
  _email text,
  _phone_number text,
  _tour_id uuid,
  _booking_date date,
  _selected_time time,
  _slots integer,
  _total_price numeric,
  _payment_method text,
  _payment_id text,
  _products jsonb,
  _slot_details jsonb,
  _promo_code_id uuid DEFAULT NULL,
  _promo_code text DEFAULT NULL,
  _discount_amount numeric DEFAULT NULL
)
RETURNS TABLE(
  booking_id uuid,
  reference_number text,
  manage_token uuid,
  tour_title text,
  tour_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id uuid;
  v_customer_id uuid;
  v_manage_token uuid;
  v_reference_number text;
  v_tour_title text;
  v_tour_rate numeric;
BEGIN
  -- Start transaction
  BEGIN
    -- Get or create customer
    INSERT INTO users (email, full_name, phone_number, role)
    VALUES (_email, _first_name || ' ' || _last_name, _phone_number, 'customer')
    ON CONFLICT (email) DO UPDATE
    SET 
      full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number
    RETURNING id INTO v_customer_id;

    -- Generate manage token and reference number
    v_manage_token := gen_random_uuid();
    v_reference_number := 'BK-' || to_char(nextval('booking_reference_seq'), 'FM000000');

    -- Get tour information
    SELECT title, rate INTO v_tour_title, v_tour_rate
    FROM tours WHERE id = _tour_id;

    -- Create booking with promo code information
    INSERT INTO tour_bookings (
      tour_id,
      customer_id,
      booking_date,
      selected_time,
      slots,
      total_price,
      status,
      payment_method,
      payment_id,
      reference_number,
      manage_token,
      slot_details,
      promo_code_id
    )
    VALUES (
      _tour_id,
      v_customer_id,
      _booking_date,
      _selected_time,
      _slots,
      _total_price,
      'pending_payment',
      _payment_method,
      _payment_id,
      v_reference_number,
      v_manage_token,
      _slot_details,
      _promo_code_id
    )
    RETURNING id INTO v_booking_id;

    -- Insert products if any
    IF _products IS NOT NULL AND jsonb_array_length(_products) > 0 THEN
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
      FROM jsonb_array_elements(_products) AS product;
    END IF;

    -- Increment times_used for promo code if provided
    IF _promo_code_id IS NOT NULL THEN
      UPDATE promo_codes 
      SET times_used = times_used + 1
      WHERE id = _promo_code_id;
    END IF;

    -- Return booking information
    RETURN QUERY SELECT 
      v_booking_id,
      v_reference_number,
      v_manage_token,
      v_tour_title,
      v_tour_rate;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Error creating booking: %', SQLERRM;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_full_booking_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION create_full_booking_v2 TO service_role; 