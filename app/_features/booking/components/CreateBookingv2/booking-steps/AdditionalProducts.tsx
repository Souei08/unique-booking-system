import { Product } from "@/app/_features/products/types/product-types";
import { Check } from "lucide-react";

interface AdditionalProductsProps {
  isLoadingProducts: boolean;
  availableProducts: Product[];
  selectedProducts: string[];
  setSelectedProducts: (
    products: string[] | ((prev: string[]) => string[])
  ) => void;
  productQuantities: Record<string, number>;
  setProductQuantities: (
    quantities:
      | Record<string, number>
      | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;
  isReadOnly?: boolean;
  showHeader?: boolean;
  showCard?: boolean;
}

const AdditionalProducts = ({
  isLoadingProducts,
  availableProducts,
  selectedProducts,
  setSelectedProducts,
  productQuantities,
  setProductQuantities,
  isReadOnly = false,
  showHeader = true,
  showCard = true,
}: AdditionalProductsProps) => {
  const updateProductQuantity = (
    productId: string,
    quantity: number,
    booking_product_id?: string | null
  ) => {
    if (isReadOnly) return;

    if (quantity < 1) {
      // Remove product from selection when quantity is 0
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      setProductQuantities((quantities) => {
        const newQuantities = { ...quantities };
        delete newQuantities[productId];
        return newQuantities;
      });
      return;
    }

    // Add product to selection if not already selected
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts((prev) => [...prev, productId]);
    }

    setProductQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const content = (
    <>
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-strong">
            Additional Products
          </h2>
          <span className="text-small text-weak">
            {selectedProducts.length} selected
          </span>
        </div>
      )}
      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stroke-strong"></div>
        </div>
      ) : availableProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {availableProducts.map((product) => (
            <div
              key={product.id}
              className={`border rounded-2xl overflow-hidden shadow-md border-gray-200 relative`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 order-first sm:order-last">
                  <img
                    src={product.image_url || ""}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex flex-col h-full justify-between gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-body font-bold text-strong truncate">
                            {product.name}
                          </h3>
                          <p className="text-small text-weak mt-1.5 line-clamp-2 sm:line-clamp-none">
                            {product.description}
                          </p>
                        </div>
                        {!isReadOnly &&
                          selectedProducts.includes(product.id) && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-brand" />
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-body-lg font-bold text-strong">
                            ${parseFloat(product.price.toString()).toFixed(2)}
                          </span>
                          <span className="text-small text-weak">
                            / per item
                          </span>
                        </div>
                        {!isReadOnly && (
                          <div className="flex items-center space-x-1 bg-background rounded-lg px-2 py-1 border border-stroke-weak">
                            <button
                              onClick={() =>
                                updateProductQuantity(
                                  product.id,
                                  (productQuantities[product.id] || 0) - 1,
                                  product?.product_booking_id || ""
                                )
                              }
                              className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center rounded-full transition-colors hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-8 sm:w-6 text-center font-medium text-strong">
                              {productQuantities[product.id] || 0}
                            </span>
                            <button
                              onClick={() =>
                                updateProductQuantity(
                                  product.id,
                                  (productQuantities[product.id] || 0) + 1,
                                  product?.product_booking_id || ""
                                )
                              }
                              className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center rounded-full transition-colors hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        )}
                        {isReadOnly && (
                          <div className="grid grid-cols-1 sm:flex sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-stroke-weak">
                              <span className="text-sm text-weak">
                                Quantity:
                              </span>
                              <span className="text-sm font-medium text-strong">
                                {productQuantities[product.id] || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-stroke-weak">
                              <span className="text-sm text-weak">Total:</span>
                              <span className="text-sm font-medium text-strong">
                                $
                                {(
                                  (productQuantities[product.id] || 0) *
                                  parseFloat(product.price.toString())
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-stroke-strong"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-h2 font-semibold text-strong mb-3">
            No Additional Products
          </h3>
          <p className="text-body text-weak max-w-md mx-auto">
            There are no additional products available for this tour.
          </p>
        </div>
      )}
    </>
  );

  if (showCard) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border bg-card shadow-lg p-4 sm:p-8">
        {content}
      </div>
    );
  }

  return content;
};

export default AdditionalProducts;
