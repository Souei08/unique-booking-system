"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TourFormV2 from "@/app/_features/tours/forms/upsert-tour-v2/TourFormV2";

export default function CreateTourPage() {
  const router = useRouter();

  const handleComplete = (data: any) => {
    try {
      // Here you would typically save the tour data to your backend
      console.log("Tour created successfully:", data);

      toast.success("Tour created successfully!");

      // Navigate to the tours list or the created tour
      router.push("/dashboard/tours");
    } catch (error) {
      console.error("Error creating tour:", error);
      toast.error("Failed to create tour. Please try again.");
    }
  };

  const handleCancel = () => {
    toast.info("Tour creation cancelled");
    router.push("/dashboard/tours");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TourFormV2
        onComplete={handleComplete}
        onCancel={handleCancel}
        className="h-screen"
      />
    </div>
  );
}
