import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCw, Package } from "lucide-react";
import AdditionalProducts from "../CreateBookingv2/booking-steps/AdditionalProducts";
import { toast } from "sonner";
import { updateBookingProducts } from "../../api/update-booking/UpdateBookingProducts";
import { Product } from "@/app/_features/products/types/product-types";
import {
  AdditionalProduct,
  CustomerInformation,
} from "../../types/booking-types";

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  initialProducts: AdditionalProduct[];
  availableProducts: Product[];
  isLoadingProducts: boolean;
  paymentStatus: string;
  paymentLink?: string;
  stripePaymentId?: string;
  handlePaymentLinkUpdate: (
    isUpdate: boolean,
    currentSlots: any[] | null,
    currentProducts: AdditionalProduct[] | null,
    currentCustomerInfo: CustomerInformation | null
  ) => Promise<boolean | undefined>;
}

const ProductsModal: React.FC<ProductsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  initialProducts,
  availableProducts,
  isLoadingProducts,
  paymentStatus,
  paymentLink,
  stripePaymentId,
  handlePaymentLinkUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editedProducts, setEditedProducts] =
    useState<AdditionalProduct[]>(initialProducts);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    setSelectedProducts(editedProducts.map((product) => product.id));
    setProductQuantities(
      editedProducts.reduce(
        (acc, product) => ({
          ...acc,
          [product.id]: product.quantity,
        }),
        {}
      )
    );
  }, [editedProducts]);

  const validateProducts = (products: AdditionalProduct[]): boolean => {
    if (!products || !Array.isArray(products)) return false;
    return products.every(
      (product) =>
        product.name &&
        typeof product.quantity === "number" &&
        product.quantity >= 0 &&
        typeof product.unit_price === "number" &&
        product.unit_price >= 0
    );
  };

  const handleUpdateProducts = async () => {
    setEditError(null);

    // Validate products
    if (!validateProducts(editedProducts)) {
      setEditError("Invalid product details. Please check all fields.");
      return;
    }

    setIsLoading(true);
    try {
      // Format products for the API
      const productsData = selectedProducts.map((productId) => {
        const product = availableProducts.find((p) => p.id === productId);
        const quantity = productQuantities[productId] || 1;

        return {
          name: product?.name,
          product_id: productId,
          quantity: quantity,
          unit_price: product?.price || 0,
        };
      });

      console.log("productsData", productsData);
      console.log("selectedProducts", selectedProducts);
      console.log("productQuantities", productQuantities);

      // Update products
      await updateBookingProducts(bookingId, productsData);

      // If there's a payment link, update it
      if (paymentLink) {
        await handlePaymentLinkUpdate(
          true,
          [],
          productsData as AdditionalProduct[],
          null
        );
      }

      toast.success("Products updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Products update error:", error);
      setEditError(
        error instanceof Error ? error.message : "Failed to update products"
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to update products"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setEditError(null);
          setEditedProducts(initialProducts);
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-strong flex items-center gap-2">
            <Package className="w-5 h-5" />
            Edit Additional Products
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Update the additional products for this booking. You can add,
            remove, or modify products as needed.
          </p>
        </DialogHeader>
        {editError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{editError}</p>
          </div>
        )}
        <div className="py-4">
          <AdditionalProducts
            isLoadingProducts={isLoadingProducts}
            availableProducts={availableProducts}
            selectedProducts={selectedProducts}
            setSelectedProducts={(products) => {
              setSelectedProducts(products);
            }}
            productQuantities={productQuantities}
            setProductQuantities={setProductQuantities}
            isReadOnly={false}
            showHeader={false}
            showCard={false}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setEditedProducts(initialProducts);
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateProducts} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsModal;
