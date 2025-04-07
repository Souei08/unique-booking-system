"use client";

import { useEffect } from "react";
import Button from "@/app/_components/common/button/index";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function ErrorSchedule({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Schedule page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Something went wrong!
          </h1>
          <p className="mt-2 text-gray-600">
            We encountered an error while loading the schedule page. Please try
            again.
          </p>
          <div className="mt-6">
            <Button
              onClick={reset}
              variant="primary"
              className="inline-flex items-center"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
