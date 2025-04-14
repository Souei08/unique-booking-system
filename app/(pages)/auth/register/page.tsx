import React from "react";

import CompanyLogo from "@/app/_components/common/logo";

import { RegisterForm } from "@/app/_features/auth/forms/auth";
import GoogleLoginButton from "@/app/_components/common/GoogleLoginButton";

const page = () => {
  return (
    <div className="flex h-screen flex-1">
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt=""
          src="/auth/register-feature-img.jpeg"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <CompanyLogo />

            <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-strong">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm/6 text-weak">
              Already a member?{" "}
              <a
                href="/auth/login"
                className="font-semibold text-brand hover:underline"
              >
                Sign in here
              </a>
            </p>
          </div>

          <div className="mt-10">
            <div>
              <RegisterForm />
            </div>

            <div className="mt-10">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm/6 font-medium">
                  <span className="bg-white px-6 text-strong">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleLoginButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
