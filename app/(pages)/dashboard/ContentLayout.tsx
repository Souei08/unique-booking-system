"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";

import UpsertTourV2 from "../../_features/tours/forms/upsert-tour-v2/UpsertTourV2";
import CreateBookingv2 from "../../_features/booking/components/CreateBookingv2/CreateBookingv2";

interface ContentLayoutProps {
  title: string;
  description: string;
  buttonText?: string;
  children: React.ReactNode;

  modalTitle: string;
  modalDescription?: string;
  modalRoute: "booking" | "tours" | "users" | "products";
}

const ContentLayout = ({
  title,
  description,
  children,
  modalTitle,

  buttonText,
  modalDescription,
  modalRoute,
}: ContentLayoutProps) => {
  const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const handleButtonClick = () => {
    if (modalRoute === "users") {
      setIsUserDialogOpen(true);
    } else if (modalRoute === "products") {
      setIsProductDialogOpen(true);
    } else {
      setIsTourDialogOpen(true);
    }
  };

  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-dvh">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-h2 font-bold text-strong">{title}</h1>
            <p className="mt-2 text-lg text-weak">{description}</p>
          </div>

          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="block rounded-md bg-brand px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer"
              onClick={handleButtonClick}
            >
              {buttonText}
            </button>
          </div>
        </div>

        {children}
      </div>

      <Dialog open={isTourDialogOpen} onOpenChange={setIsTourDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-5">
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>

          {modalRoute === "tours" && (
            <UpsertTourV2 onSuccess={() => setIsTourDialogOpen(false)} />
          )}

          {modalRoute === "booking" && (
            <CreateBookingv2 onClose={() => setIsTourDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-5">
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-5">
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ContentLayout;
