import React from "react";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import PromoTable from "@/app/_features/promos/components/PromoTable";

const PromosPage = () => {
  return (
    <ContentLayout
      title="Promos Codes"
      buttonText="Create Promo"
      description="View and manage all current promos."
      modalTitle="Create a new promo"
      modalDescription="Create a new promo to add to the list."
      modalRoute="promos"
    >
      <PromoTable />
    </ContentLayout>
  );
};

export default PromosPage;
