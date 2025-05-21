import React from "react";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";

const ProductsPage = () => {
  return (
    <ContentLayout
      title="List of Products"
      buttonText="Create Product"
      description="View and manage all current products."
      modalTitle="Create a new product"
      modalDescription="Create a new product to add to the list."
      modalRoute="products"
    >
      <h1>Products</h1>
      {/* <UsersTable users={users as User[]} /> */}
    </ContentLayout>
  );
};

export default ProductsPage;
