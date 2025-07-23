import { UpsertUser } from "@/app/_features/users/form/UpsertUser";
import QuickBooking from "@/app/_features/booking/components/QuickBooking/QuickBooking";
import UpsertPromo from "@/app/_features/promos/components/UpsertPromo";
import UpsertTourV2Stepped from "@/app/_features/tours/forms/upsert-tour-v2/UpsertTourV2Stepped";
import UpsertProductV2 from "@/app/_features/products/components/UpsertProductV2";

// Modal configuration type
export interface ModalConfig {
  component: React.ComponentType<any>;
  props: Record<string, any>;
  dialogClassName?: string;
  disableCloseOnOutside?: boolean;
  showCloseConfirmation?: boolean;
  hideHeader?: boolean;
  closeConfirmationTitle?: string;
  closeConfirmationDescription?: string;
  closeConfirmationType?: "success" | "error" | "warning" | "info" | "custom";
}

// Modal configurations
export const MODAL_CONFIGS: Record<string, ModalConfig> = {
  users: {
    component: UpsertUser,
    props: {},
    dialogClassName: "max-w-lg",
  },
  products: {
    component: UpsertProductV2,
    props: {},
    dialogClassName: "max-w-lg",
    disableCloseOnOutside: true,
    showCloseConfirmation: true,
  },
  promos: {
    component: UpsertPromo,
    props: {},
    disableCloseOnOutside: true,
    showCloseConfirmation: true,
  },
  tours: {
    component: UpsertTourV2Stepped,
    props: {},
    dialogClassName:
      "max-w-[98vw] sm:max-w-[95vw] md:max-w-[1100px] lg:max-w-[1400px] xl:max-w-[1600px] max-h-[95vh] overflow-y-auto p-2 sm:p-4 md:p-6",
  },
  booking: {
    component: QuickBooking,
    props: {
      selectedTour: null,
      selectedDate: null,
      selectedTime: null,
    },
    dialogClassName:
      "bg-neutral max-w-[98vw] sm:max-w-[95vw] md:max-w-[1200px] lg:max-w-[1200px] xl:max-w-[1200px] max-h-[95vh] overflow-y-auto p-0",
    hideHeader: true,
    disableCloseOnOutside: true,
    showCloseConfirmation: true,
    closeConfirmationTitle: "Cancel Booking?",
    closeConfirmationDescription:
      "Are you sure you want to cancel this booking? All entered information will be lost.",
    closeConfirmationType: "error",
  },
};

// Helper function to get modal config
export const getModalConfig = (modalRoute: string): ModalConfig | null => {
  return MODAL_CONFIGS[modalRoute] || null;
};

// Helper function to check if modal route is valid
export const isValidModalRoute = (modalRoute: string): boolean => {
  return modalRoute in MODAL_CONFIGS;
};
