import React from "react";
import Image from "next/image";

const CompanyLogo = () => {
  return (
    <Image
      alt="Wentech"
      src="/logo/wentech-logo-removebg-preview.png"
      className="h-[40px] w-[200px] object-cover"
      width={400}
      height={200}
      style={{
        objectPosition: "-0px",
      }}
    />
  );
};

export default CompanyLogo;
