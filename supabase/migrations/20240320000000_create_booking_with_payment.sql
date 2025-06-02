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