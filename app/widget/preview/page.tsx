import { Suspense } from "react";
import TourBookingsClient from "@/app/_features/widget/components/TourBookingsClient";

export default function TourBookingWidgetPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[98vw] sm:max-w-[95vw] md:max-w-[1200px] lg:max-w-[1200px] xl:max-w-[1200px] mx-auto ">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg ">
          <Suspense
            fallback={
              <div className="w-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading widget...</p>
              </div>
            }
          >
            <TourBookingsClient />
          </Suspense>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Embed Instructions
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>WordPress Embed URL:</strong>{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">
                /widget/embed?booking_id=YOUR_TOUR_ID
              </code>
            </p>
            <p>
              <strong>Preview URL:</strong>{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">
                /widget/preview?booking_id=YOUR_TOUR_ID
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
