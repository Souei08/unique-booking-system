import { createClient } from "@/supabase/client";

export async function getRemainingSlots(
  tourId: string,
  date: string,
  time: string
) {
  try {
    const supabase = await createClient();

    // Get the tour's group size limit
    const { data: tourData, error: tourError } = await supabase
      .from("tours")
      .select("group_size_limit")
      .eq("id", tourId)
      .single();

    if (tourError) {
      console.error("Error fetching tour data:", tourError);
      return 0;
    }

    const maxSlots = tourData.group_size_limit;

    // Get all bookings for the specific date and time
    const { data: bookings, error: bookingsError } = await supabase
      .from("tour_bookings")
      .select("slots")
      .eq("tour_id", tourId)
      .eq("booking_date", date)
      .eq("selected_time", time);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return 0;
    }

    // Calculate total booked slots
    const totalBookedSlots = bookings.reduce(
      (sum, booking) => sum + booking.slots,
      0
    );

    // Calculate remaining slots
    const remainingSlots = Math.max(0, maxSlots - totalBookedSlots);

    return remainingSlots;
  } catch (error: any) {
    console.error("Error getting remaining slots:", error);
    return 0;
  }
}
