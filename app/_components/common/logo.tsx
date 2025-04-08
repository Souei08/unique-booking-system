import React from "react";
import Image from "next/image";

const CompanyLogo = () => {
  return (
    <Image
      alt="Wentech"
      src="/logo/wentech-logo-removebg-preview.png"
      className="h-20 w-auto"
      width={400}
      height={400}
    />
  );
};

export default CompanyLogo;
