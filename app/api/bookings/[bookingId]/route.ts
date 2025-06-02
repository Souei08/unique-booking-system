import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

interface User {
  full_name: string;
  email: string;
  phone_number: string;
}

interface BookingResponse {
  id: string;
  tour_id: string;
  booking_date: string;
  selected_time: string;
  slots: number;
  total_price: number;
  status: string;
  payment_link: string | null;
  reference_number: string;
  created_at: string;
  updated_at: string;
  users: {
    full_name: string;
    email: string;
    phone_number: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = await params.bookingId;
    const supabase = await createClient();

    const { data: booking, error } = await supabase
      .from("tour_bookings")
      .select(
        `
        id,
        tour_id,
        booking_date,
        selected_time,
        slots,
        total_price,
        status,
        payment_link,
        reference_number,
        created_at,
        updated_at,
        users!tour_bookings_customer_id_fkey (
          full_name,
          email,
          phone_number
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      return NextResponse.json(
        { error: "Failed to fetch booking details" },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Safely convert the response using a double type assertion
    const typedBooking = booking as unknown as BookingResponse;

    // Transform the data to match the expected format
    const transformedBooking = {
      booking_id: typedBooking.id,
      tour_id: typedBooking.tour_id,
      booking_date: typedBooking.booking_date,
      selected_time: typedBooking.selected_time,
      slots: typedBooking.slots,
      total_price: typedBooking.total_price,
      booking_status: typedBooking.status,
      payment_link: typedBooking.payment_link,
      reference_number: typedBooking.reference_number,
      full_name: typedBooking.users.full_name,
      email: typedBooking.users.email,
      phone_number: typedBooking.users.phone_number,
      created_at: typedBooking.created_at,
      updated_at: typedBooking.updated_at,
    };

    return NextResponse.json(transformedBooking);
  } catch (error) {
    console.error("Error in booking details API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
