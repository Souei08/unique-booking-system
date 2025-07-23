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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <h2 className="text-lg font-bold text-strong mb-4">
            Additional Products
          </h2>
          <span className="text-xs text-[#666666]">
            {selectedProducts.length} selected
          </span>
        </div>
      )}
      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
        </div>
      ) : availableProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {availableProducts.map((product) => (
            <div
              key={product.id}
              className={`border rounded-xl overflow-hidden shadow-sm border-gray-200 relative`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Product Image */}
                <div className="w-full sm:w-40 h-32 sm:h-auto flex-shrink-0 order-first sm:order-last">
                  <img
                    src={product.image_url || ""}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex flex-col h-full justify-between gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#1a1a1a] truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-[#666666] mt-1 line-clamp-2 sm:line-clamp-none">
                            {product.description}
                          </p>
                        </div>
                        {!isReadOnly &&
                          selectedProducts.includes(product.id) && (
                            <div className="flex-shrink-0">
                              <div className="w-5 h-5 rounded-full bg-[#0066cc]/10 flex items-center justify-center">
                                <Check className="w-3 h-3 text-[#0066cc]" />
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#1a1a1a]">
                            ${parseFloat(product.price.toString()).toFixed(2)}
                          </span>
                          <span className="text-xs text-[#666666]">
                            / per item
                          </span>
                        </div>
                        {!isReadOnly && (
                          <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 border border-gray-300">
                            <button
                              onClick={() =>
                                updateProductQuantity(
                                  product.id,
                                  (productQuantities[product.id] || 0) - 1,
                                  product?.product_booking_id || ""
                                )
                              }
                              className="w-5 h-5 flex items-center justify-center rounded-full transition-colors hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-medium text-[#1a1a1a] text-sm">
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
                              className="w-5 h-5 flex items-center justify-center rounded-full transition-colors hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        )}
                        {isReadOnly && (
                          <div className="grid grid-cols-1 sm:flex sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-[#666666]">
                                Quantity:
                              </span>
                              <span className="text-xs font-medium text-[#1a1a1a]">
                                {productQuantities[product.id] || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-[#666666]">
                                Total:
                              </span>
                              <span className="text-xs font-medium text-[#1a1a1a]">
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
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-[#666666]"
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
          <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">
            No Additional Products
          </h3>
          <p className="text-sm text-[#666666] max-w-md mx-auto">
            There are no additional products available for this tour.
          </p>
        </div>
      )}
    </>
  );

  if (showCard) {
    return (
      <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6">
        {content}
      </div>
    );
  }

  return content;
};

export default AdditionalProducts;
