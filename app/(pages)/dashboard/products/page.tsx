import React from "react";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import ProductTable from "@/app/_features/products/components/ProductTable";
import { Product } from "@/app/_features/products/types/product-types";
import { getAllProducts } from "@/app/_features/products/api/getAllProducts";
import { getAllTours } from "@/app/_features/tours/api/getTours";

const ProductsPage = async () => {
  const products = await getAllProducts();
  const tours = await getAllTours();

  return (
    <ContentLayout
      title="Products"
      buttonText="Create Product"
      description="View and manage all current products."
      modalTitle="Create a new product"
      modalDescription="Create a new product to add to the list."
      modalRoute="products"
    >
      <ProductTable products={products as Product[]} tours={tours as any} />
    </ContentLayout>
  );
};

export default ProductsPage;
