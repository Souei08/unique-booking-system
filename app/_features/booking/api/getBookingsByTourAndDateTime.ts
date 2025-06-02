import { createClient } from "@/supabase/client";
import { BookingResponse } from "../types/booking-types";

interface GetBookingsByTourAndDateTimeParams {
  tourTitle: string;
  date: string;
  time: string;
}

interface TourBooking {
  id: string;
  tour_id: string;
  customer_id: string;
  booking_date: string;
  selected_time: string;
  slots: number;
  total_price: number;
  status: string;
  manage_token: string;
  created_at: string;
  updated_at: string | null;
  reference_number: string;
  payment_link: string | null;
  tours: {
    title: string;
  };
  users: {
    full_name: string;
    email: string;
    phone_number: string | null;
  };
  payments: Array<{
    payment_method: string;
    payment_id: string;
    status: string;
    amount_paid: number;
  }>;
}

export async function getBookingsByTourAndDateTime({
  tourTitle,
  date,
  time,
}: GetBookingsByTourAndDateTimeParams): Promise<BookingResponse[]> {
  try {
    const supabase = createClient();

    // Convert the date string to a Date object and format it to YYYY-MM-DD
    const bookingDate = new Date(date);
    const formattedDate = bookingDate.toISOString().split("T")[0];

    const { data, error } = (await supabase
      .from("tour_bookings")
      .select(
        `
        id,
        tour_id,
        customer_id,
        booking_date,
        selected_time,
        slots,
        total_price,
        status,
        manage_token,
        created_at,
        updated_at,
        reference_number,
        payment_link,
        tours!inner (
          title
        ),
        users!inner (
          full_name,
          email,
          phone_number
        ),
        payments (
          payment_method,
          payment_id,
          status,
          amount_paid
        )
      `
      )
      .eq("tours.title", tourTitle)
      .eq("booking_date", formattedDate)
      .eq("selected_time", time)
      .order("created_at", { ascending: false })) as {
      data: TourBooking[] | null;
      error: any;
    };

    if (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Failed to fetch bookings");
    }

    if (!data) {
      return [];
    }

    return data.map((booking) => {
      const users = booking.users;
      const tour = booking.tours;
      const payment = booking.payments?.[0] || null;
      const fullName = users.full_name || "";
      const nameParts = fullName.split(" ");

      return {
        id: booking.id,
        tour_id: booking.tour_id,
        customer_id: booking.customer_id,
        booking_date: booking.booking_date,
        selected_time: booking.selected_time,
        slots: booking.slots,
        total_price: booking.total_price,
        status: booking.status,
        manage_token: booking.manage_token,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        reference_number: booking.reference_number,
        payment_link: booking.payment_link,
        tours: {
          title: tour.title,
        },
        users: {
          full_name: fullName,
          email: users.email,
          phone_number: users.phone_number,
        },
        payments: booking.payments,
      };
    });
  } catch (error) {
    console.error("Error in getBookingsByTourAndDateTime:", error);
    throw error;
  }
}
