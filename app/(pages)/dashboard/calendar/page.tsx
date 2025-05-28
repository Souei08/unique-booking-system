import React from "react";
import ContentLayout from "../ContentLayout";
import CalendarBookingPage from "@/app/_components/calendar-booking/page";
const page = () => {
  return (
    <ContentLayout
      title="Event Calendar"
      description="Manage and view your scheduled events and appointments."
    >
      <CalendarBookingPage />
    </ContentLayout>
  );
};

export default page;
