import React from "react";
import ContentLayout from "@/app/(pages)/dashboard/ContentLayout";
import PromoTable from "@/app/_features/promos/components/PromoTable";
import { Promo } from "@/app/_features/promos/types/promo-types";
import { getAllPromos } from "@/app/_features/promos/api/getAllPromos";

const PromosPage = async () => {
  const initialPromos = await getAllPromos();

  return (
    <ContentLayout
      title="Promos Codes"
      buttonText="Create Promo"
      description="View and manage all current promos."
      modalTitle="Create a new promo"
      modalDescription="Create a new promo to add to the list."
      modalRoute="promos"
    >
      <PromoTable initialPromos={initialPromos as Promo[]} />
    </ContentLayout>
  );
};

export default PromosPage;
