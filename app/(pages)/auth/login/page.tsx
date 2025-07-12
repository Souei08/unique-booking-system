import React from "react";

import { LoginForm } from "@/app/_features/auth/forms/auth";
import CompanyLogo from "@/app/_components/common/logo";

const page = async () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-stroke-weak">
        <div className="flex flex-col items-center">
          <CompanyLogo width={64} height={64} className="h-16 w-16" />
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-strong text-center">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-weak text-center">
            Login with your email and password
          </p>
        </div>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default page;
