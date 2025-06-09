"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import UpsertTourV2 from "../../_features/tours/forms/upsert-tour-v2/UpsertTourV2";
import CreateBookingv2 from "../../_features/booking/components/CreateBookingv2/CreateBookingv2";
import { UpsertUser } from "@/app/_features/users/form/UpsertUser";
import CreateProduct from "@/app/_features/products/components/CreateProduct";
import QuickBooking from "@/app/_features/booking/components/QuickBooking/QuickBooking";

interface ContentLayoutProps {
  title: string;
  description: string;
  buttonText?: string;
  children: React.ReactNode;

  modalTitle?: string;
  modalDescription?: string;
  modalRoute?: "booking" | "tours" | "users" | "products";
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleButtonClick = () => {
    if (modalRoute === "users") {
      setIsUserDialogOpen(true);
    } else if (modalRoute === "products") {
      setIsProductDialogOpen(true);
    } else {
      setIsTourDialogOpen(true);
    }
  };

  const handleDialogClose = (setDialogOpen: (value: boolean) => void) => {
    if (modalRoute === "booking") {
      setShowConfirmDialog(true);
    } else {
      setDialogOpen(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setIsTourDialogOpen(false);
  };

  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-dvh">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-h2 font-bold text-strong">{title}</h1>
            <p className="mt-2 text-lg text-weak">{description}</p>
          </div>

          {buttonText && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                className="block rounded-md bg-brand px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer"
                onClick={handleButtonClick}
              >
                {buttonText}
              </button>
            </div>
          )}
        </div>

        {children}
      </div>

      <Dialog
        open={isTourDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose(setIsTourDialogOpen);
          } else {
            setIsTourDialogOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-5">
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>

          {modalRoute === "tours" && (
            <UpsertTourV2 onSuccess={() => setIsTourDialogOpen(false)} />
          )}

          {modalRoute === "booking" && (
            <QuickBooking
              onClose={() => handleDialogClose(setIsTourDialogOpen)}
              selectedTour={null as any}
              selectedDate={null as any}
              selectedTime={null as any}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-5">
            <DialogTitle>{modalTitle}</DialogTitle>

            <UpsertUser onSuccess={() => setIsUserDialogOpen(false)} />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-h1 font-bold text-strong">
              {modalTitle}
            </DialogTitle>
          </DialogHeader>

          <CreateProduct onSuccess={() => setIsProductDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              Your booking progress will be lost if you leave this page. Are you
              sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Yes, leave page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default ContentLayout;
