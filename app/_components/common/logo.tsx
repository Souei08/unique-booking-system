import React from "react";
import Image from "next/image";

const CompanyLogo = () => {
  return (
    <Image
      alt="Your Company"
      src="/logo/unique_logo-removebg-preview-2.png"
      className="h-8 w-auto"
      width={100}
      height={100}
    />
  );
};

export default CompanyLogo;
