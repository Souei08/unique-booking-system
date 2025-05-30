import React from "react";
import Image from "next/image";

const CompanyLogo = () => {
  return (
    <Image
      alt="Wentech"
      src="/logo/wentech-logo-latest.png"
      // className="h-auto w-full object-cover"
      className="h-[150px] w-[150px] object-cover"
      width={400}
      height={200}
      style={{
        objectPosition: "-0px",
      }}
    />
  );
};

export default CompanyLogo;
