import { Suspense } from "react";
import TourBookingsClient from "@/app/_features/widget/components/TourBookingsClient";

export default function TourBookingWidgetEmbedPage() {
  return (
    <div className="w-full">
      <Suspense
        fallback={<div className="w-full text-center py-4">Loading...</div>}
      >
        <TourBookingsClient />
      </Suspense>
    </div>
  );
}
