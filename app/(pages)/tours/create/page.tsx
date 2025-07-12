"use client";

import React, { Suspense } from "react";
import UpsertTourV2Stepped from "@/app/_features/tours/forms/upsert-tour-v2/UpsertTourV2Stepped";

const CreateTourPage = () => {
  return (
    <div className="min-h-screen bg-neutral">
      <Suspense
        fallback={<div className="w-7/12 mx-auto pt-10">Loading...</div>}
      >
        <UpsertTourV2Stepped />
      </Suspense>
    </div>
  );
};

export default CreateTourPage;
