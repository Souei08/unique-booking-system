import React from "react";
import Image from "next/image";

interface CompanyLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const CompanyLogo = ({
  width = 150,
  height = 150,
  className = "h-[150px] w-[150px]",
}: CompanyLogoProps) => {
  return (
    <Image
      alt="Wentech"
      src="/logo/wentech-logo-latest.png"
      className={`object-cover ${className}`}
      width={width}
      height={height}
      style={{
        objectPosition: "-0px",
      }}
    />
  );
};

export default CompanyLogo;
