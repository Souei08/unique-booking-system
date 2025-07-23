import { Suspense } from "react";
import UpdateCustomerBooking from "@/app/_features/manage-booking/UpdateCustomerBooking";

const ManageBookingPage = () => {
  return (
    <div className="bg-default">
      <Suspense
        fallback={<div className="w-7/12 mx-auto pt-10">Loading...</div>}
      >
        <UpdateCustomerBooking />
      </Suspense>
    </div>
  );
};

export default ManageBookingPage;
