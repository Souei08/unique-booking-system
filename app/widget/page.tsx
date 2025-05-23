"use client";

import React from "react";
import CreateBookingv2 from "../_features/booking/components/CreateBookingv2/CreateBookingv2";

const TourBookingWidget = () => {
  return (
    <div className="w-7/12 mx-auto pt-10">
      <CreateBookingv2 onClose={() => {}} />
    </div>
  );
};

export default TourBookingWidget;
