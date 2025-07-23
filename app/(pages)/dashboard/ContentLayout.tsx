"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { useModal } from "./useModal";
import { useRouter } from "next/navigation";

// import UpsertTourV2 from "../../_features/tours/forms/upsert-tour-v2/UpsertTourV2";
// import CreateBookingv2 from "../../_features/booking/components/CreateBookingv2/CreateBookingv2";

import { MODAL_CONFIGS } from "./modalConfigs";

interface ContentLayoutProps {
  title: string;
  description: string;
  buttonText?: string;
  children: React.ReactNode;

  modalTitle?: string;
  modalDescription?: string;
  modalRoute?: "booking" | "tours" | "users" | "products" | "promos";
  displayMode?: "modal" | "page" | "redirect";
  redirectUrl?: string;
}

// Reusable Modal Component
interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  modalRoute: string;
  modalTitle?: string;
  modalDescription?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  modalRoute,
  modalTitle,
  modalDescription,
}) => {
  const config = MODAL_CONFIGS[modalRoute];

  if (!config) return null;

  const {
    component: Component,
    props,
    dialogClassName,
    disableCloseOnOutside,
    showCloseConfirmation,
    hideHeader,
    closeConfirmationTitle,
    closeConfirmationDescription,
    closeConfirmationType,
  } = config;

  // Handle success callback
  const handleSuccess = () => {
    onClose();
  };

  // Handle cancel callback
  const handleCancel = () => {
    onClose();
  };

  // Component props with callbacks
  const componentProps = {
    ...props,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
    onClose: onClose,
  };

  // Use regular Dialog for all modals
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${dialogClassName}`}
        disableCloseOnOutside={disableCloseOnOutside}
        showCloseConfirmation={showCloseConfirmation}
        onCloseConfirmCallback={onClose}
        closeConfirmationTitle={closeConfirmationTitle}
        closeConfirmationDescription={closeConfirmationDescription}
        closeConfirmationType={closeConfirmationType}
        // alertConfig={
        //   closeConfirmationTitle || closeConfirmationDescription
        //     ? {
        //         title: closeConfirmationTitle,
        //         message: closeConfirmationDescription,
        //       }
        //     : undefined
        // }
      >
        {/* {!hideHeader && ( */}
        <DialogHeader className={hideHeader ? "sr-only" : ""}>
          <DialogTitle className="text-strong text-xl font-bold ">
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="text-weak text-sm">
            {modalDescription}
          </DialogDescription>
        </DialogHeader>
        {/* )} */}
        <Component {...componentProps} />
      </DialogContent>
    </Dialog>
  );
};

// Page Content Component
interface PageContentWrapperProps {
  modalRoute: string;
  modalTitle?: string;
  modalDescription?: string;
  onBack: () => void;
}

const PageContentWrapper: React.FC<PageContentWrapperProps> = ({
  modalRoute,
  modalTitle,
  modalDescription,
  onBack,
}) => {
  const config = MODAL_CONFIGS[modalRoute];

  if (!config) return null;

  const { component: Component, props } = config;

  // Handle success callback
  const handleSuccess = () => {
    onBack();
  };

  // Handle cancel callback
  const handleCancel = () => {
    onBack();
  };

  // Component props with callbacks
  const componentProps = {
    ...props,
    onSuccess: handleSuccess,
    onCancel: handleCancel,
    onClose: onBack,
  };

  return (
    <div className="mt-6">
      {/* Back button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-strong">{modalTitle}</h2>
        {modalDescription && (
          <p className="text-text mt-2">{modalDescription}</p>
        )}
      </div>

      {/* Component content */}
      <div className="bg-white rounded-lg shadow">
        <Component {...componentProps} />
      </div>
    </div>
  );
};

const ContentLayout = ({
  title,
  description,
  children,
  modalTitle,
  buttonText,
  modalDescription,
  modalRoute,
  displayMode = "modal",
  redirectUrl,
}: ContentLayoutProps) => {
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [isPageMode, setIsPageMode] = React.useState(false);
  const router = useRouter();

  const handleButtonClick = () => {
    if (displayMode === "redirect" && redirectUrl) {
      // Handle redirect
      router.push(redirectUrl);
    } else if (modalRoute) {
      if (displayMode === "page") {
        setIsPageMode(true);
      } else {
        openModal();
      }
    }
  };

  const handleBackToMain = () => {
    setIsPageMode(false);
  };

  // If in page mode, show the form content
  if (isPageMode && modalRoute) {
    return (
      <main className="flex-1">
        <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-dvh">
          <PageContentWrapper
            modalRoute={modalRoute}
            modalTitle={modalTitle}
            modalDescription={modalDescription}
            onBack={handleBackToMain}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-dvh">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl md:text-3xl text-strong font-bold mb-2">
              {title}
            </h1>
            <p className="text-base md:text-base lg:text-lg text-text">
              {description}
            </p>
          </div>

          {buttonText &&
            (modalRoute || (displayMode === "redirect" && redirectUrl)) && (
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

      {modalRoute && displayMode === "modal" && (
        <ModalWrapper
          isOpen={isModalOpen}
          onClose={closeModal}
          modalRoute={modalRoute}
          modalTitle={modalTitle}
          modalDescription={modalDescription}
        />
      )}
    </main>
  );
};

export default ContentLayout;
