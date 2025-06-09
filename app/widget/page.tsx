import { Suspense } from "react";
import TourBookingsClient from "@/app/_features/widget/components/TourBookingsClient";

export default function TourBookingWidgetPage() {
  return (
    <Suspense fallback={<div className="w-7/12 mx-auto pt-10">Loading...</div>}>
      <TourBookingsClient />
    </Suspense>
  );
}
