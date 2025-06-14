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