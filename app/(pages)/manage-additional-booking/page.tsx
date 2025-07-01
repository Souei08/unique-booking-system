import { Suspense } from "react";
import ManageAdditionalBooking from "@/app/_features/manage-additional-booking/ManageAdditionalBooking";

const ManageAdditionalBookingPage = () => {
  return (
    <div>
      <Suspense
        fallback={<div className="w-7/12 mx-auto pt-10">Loading...</div>}
      >
        <ManageAdditionalBooking />
      </Suspense>
    </div>
  );
};

export default ManageAdditionalBookingPage;
