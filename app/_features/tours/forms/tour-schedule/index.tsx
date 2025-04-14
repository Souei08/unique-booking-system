"use client";

import { useState } from "react";
import TourScheduleForm from "./components/TourScheduleForm";

// import { Button } from "@/app/_components/common/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/app/_components/common/dialog";

interface TourScheduleProps {
  tourId: string;
  onSuccess?: () => void;
}

export default function TourSchedule({ tourId, onSuccess }: TourScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <TourScheduleForm tourId={tourId} onSuccess={handleSuccess} />

    // <>
    //   <Button onClick={() => setIsOpen(true)} variant="outline">
    //     Manage Schedule
    //   </Button>

    //   <Dialog open={isOpen} onOpenChange={setIsOpen}>
    //     <DialogContent className="max-w-3xl">
    //       <DialogHeader>
    //         <DialogTitle>Manage Tour Schedule</DialogTitle>
    //       </DialogHeader>
    //     </DialogContent>
    //   </Dialog>
    // </>
  );
}
