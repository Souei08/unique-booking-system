import { toast } from "sonner";
import { updateBookingPayment } from "../api/updateBookingPayment";
import {
  BookingTable,
  AdditionalProduct,
  CustomerInformation,
} from "../types/booking-types";
import {
  CustomSlotType,
  CustomSlotField,
} from "../components/CreateBookingv2/booking-steps/SlotDetails";

interface PaymentLinkUpdateParams {
  booking: BookingTable;
  bookingId: string;
  paymentRefId: string | null;
  isUpdate?: boolean;
  currentSlots?: any[] | null;
  currentProducts?: AdditionalProduct[] | null;
  currentCustomerInfo?: CustomerInformation | null;
  customSlotTypes?: CustomSlotType[] | null;
  customSlotFields?: CustomSlotField[] | null;
  fetchBooking?: () => Promise<void>;
}

export const handlePaymentLinkUpdate = async ({
  booking,
  bookingId,
  paymentRefId,
  isUpdate = false,
  currentSlots = null,
  currentProducts = null,
  currentCustomerInfo = null,
  customSlotTypes = null,
  customSlotFields = null,
  fetchBooking,
}: PaymentLinkUpdateParams): Promise<boolean> => {
  if (!booking) return false;

  let customerInfoInsert;
  let customerProductsInsert: any[] = [];
  let customerSlotsInsert;
  let customerSlotsCountInsert;

  if (currentCustomerInfo) {
    customerInfoInsert = {
      email: currentCustomerInfo.email,
      full_name:
        currentCustomerInfo.first_name + " " + currentCustomerInfo.last_name,
      phone: currentCustomerInfo.phone_number,
    };
  } else {
    customerInfoInsert = {
      email: booking.email,
      full_name: booking.full_name,
      phone: booking.phone_number,
    };
  }

  if (currentSlots && currentSlots.length > 0) {
    customerSlotsInsert = currentSlots;
    customerSlotsCountInsert = currentSlots.length;
  } else {
    customerSlotsInsert = booking.slot_details;
    customerSlotsCountInsert = booking.slots;
  }

  const hasExplicitProducts = Array.isArray(currentProducts);
  const productsSource = hasExplicitProducts
    ? currentProducts // explicit choice (even [] means none)
    : booking.booked_products || [];

  customerProductsInsert = productsSource.map((product) => ({
    name: product.name,
    quantity: product.quantity,
    unit_price: Math.round(product.unit_price * 100),
    description: product.description,
    images: product.image_url,
  }));

  // if (currentProducts && currentProducts.length > 0) {
  //   customerProductsInsert = currentProducts.map((product) => ({
  //     name: product.name,
  //     quantity: product.quantity,
  //     unit_price: Math.round(product.unit_price * 100),
  //     description: product.description,
  //     images: product.image_url,
  //   }));
  // } else {
  //   if (booking.booked_products && booking.booked_products.length > 0) {
  //     customerProductsInsert = booking.booked_products.map((product) => ({
  //       name: product.name,
  //       quantity: product.quantity,
  //       description: product.description,
  //       images: product.image_url,
  //       unit_price: Math.round(product.unit_price * 100),
  //     }));
  //   } else {
  //     if (!currentProducts || currentProducts.length === 0) {
  //       customerProductsInsert = [];
  //     } else {
  //       customerProductsInsert = booking.booked_products.map((product) => ({
  //         name: product.name,
  //         quantity: product.quantity,
  //         description: product.description,
  //         images: product.image_url,
  //         unit_price: Math.round(product.unit_price * 100),
  //       }));
  //     }
  //   }
  // }

  try {
    console.log({
      booking_id: bookingId,
      email: customerInfoInsert.email,
      name: customerInfoInsert.full_name,
      phone: customerInfoInsert.phone,
      slots: customerSlotsCountInsert,
      booking_price: booking.tour_rate,
      tourProducts: customerProductsInsert?.map((product) => ({
        name: product.name,
        quantity: product.quantity,
        unit_price: product.unit_price,
        description: product.description,
        images: product.image_url,
      })),
      bookingTitle: booking.tour_title,
      slotDetails: customerSlotsInsert,
      customSlotTypes: customSlotTypes || [],
      customSlotFields: customSlotFields || [],
      bookingImage: booking.tour_featured_image,
      bookingDescription: booking.tour_description,

      ...(isUpdate &&
        booking.payment_link && {
          previousSessionId: booking.payment_link,
        }),
    });

    const response = await fetch("/api/create-payment-link", {
      method: isUpdate ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: bookingId,
        payment_ref_id: paymentRefId,
        email: customerInfoInsert.email,
        name: customerInfoInsert.full_name,
        phone: customerInfoInsert.phone,
        slots: customerSlotsCountInsert,
        booking_price: booking.tour_rate,
        tourProducts: customerProductsInsert?.map((product) => ({
          name: product.name,
          quantity: product.quantity,
          unit_price: product.unit_price,
          description: product.description,
          images: product.image_url,
        })),
        bookingTitle: booking.tour_title,
        slotDetails: customerSlotsInsert,
        customSlotTypes: customSlotTypes || [],
        customSlotFields: customSlotFields || [],
        bookingImage: booking.tour_featured_image,
        bookingDescription: booking.tour_description,
        discounts: booking.stripe_coupon_id
          ? [{ coupon: booking.stripe_coupon_id }]
          : undefined,
        ...(isUpdate &&
          booking.payment_link && {
            previousSessionId: booking.payment_link,
          }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || `Failed to ${isUpdate ? "update" : "create"} payment link`
      );
    }

    // Update the booking with the payment link
    const updateResult = await updateBookingPayment({
      booking_id: bookingId,
      payment_link: data.checkoutUrl,
      status: "pending",
    });

    if (!updateResult.success) {
      throw new Error(
        `Failed to update booking with ${isUpdate ? "new " : ""}payment link`
      );
    }

    // Fetch the latest booking data if fetchBooking function is provided
    if (fetchBooking) {
      await fetchBooking();
    }

    return true;
  } catch (error) {
    console.error("Payment link error:", error);
    toast.error(`Failed to ${isUpdate ? "update" : "create"} payment link`);
    return false;
  }
};
