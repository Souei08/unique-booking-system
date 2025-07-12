import React from "react";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import ProductTable from "@/app/_features/products/components/ProductTable";
import { Product } from "@/app/_features/products/types/product-types";
import { getAllProducts } from "@/app/_features/products/api/getAllProducts";

const ProductsPage = async () => {
  const products = await getAllProducts();

  return (
    <ContentLayout
      title="Products"
      buttonText="Create Product"
      description="View and manage all current products."
      modalTitle="Create a new product"
      modalDescription="Create a new product to add to the list."
      modalRoute="products"
    >
      <ProductTable products={products as Product[]} />
    </ContentLayout>
  );
};

export default ProductsPage;
