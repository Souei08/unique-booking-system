import Script from "next/script";
import { UpcomingTours } from "@/app/_features/dashboard/components/UpcomingTours";
import { RecentBookings } from "@/app/_features/dashboard/components/RecentBookings";
import { QuickActions } from "@/app/_features/dashboard/components/QuickActions";
import { SectionCards } from "@/app/_features/dashboard/components/SectionCards";
import ContentLayout from "./ContentLayout";
import { getDashboardSummary } from "@/app/_features/dashboard/api/GetDashboardCardSummary";
import { getAllBookings } from "@/app/_features/booking/api/get-booking/getAllBookings";
import { BookingTable } from "@/app/_features/booking/types/booking-types";

async function getUpcomingTours(): Promise<BookingTable[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const upcomingBookings = await getAllBookings({
      limit_count: 5,
      offset_count: 0,
    });

    // Filter for upcoming tours (today and future dates)
    return upcomingBookings
      .filter((booking) => booking.booking_date >= today)
      .slice(0, 5);
  } catch (error) {
    console.error("Error fetching upcoming tours:", error);
    return [];
  }
}

async function getRecentBookings(): Promise<BookingTable[]> {
  try {
    const recentBookings = await getAllBookings({
      limit_count: 5,
      offset_count: 0,
      status_filter: "completed",
    });

    return recentBookings.slice(0, 5);
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return [];
  }
}

const AdminPage = async () => {
  // Fetch all data in parallel
  const [dashboardSummary, upcomingTours, recentBookings] = await Promise.all([
    getDashboardSummary(),
    getUpcomingTours(),
    getRecentBookings(),
  ]);

  return (
    <>
      <Script
        src="https://scripts.simpleanalytics.com/hello.js"
        strategy="afterInteractive"
      />
      <ContentLayout
        title="Dashboard"
        description="Overview of your tours, bookings, and business metrics"
      >
        <div className="mt-5 space-y-6">
          {/* Stats Overview */}
          {dashboardSummary && (
            <SectionCards dashboardSummary={dashboardSummary} />
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
            <UpcomingTours bookings={upcomingTours} />
            <RecentBookings bookings={recentBookings} />
          </div>
        </div>
      </ContentLayout>
    </>
  );
};

export default AdminPage;
