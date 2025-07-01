import React from "react";

import { LoginForm } from "@/app/_features/auth/forms/auth";

import CompanyLogo from "@/app/_components/common/logo";

const page = async () => {
  return (
    <div className="flex h-screen flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 border-r border-stroke-weak shadow-sm">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <CompanyLogo />
            <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-strong">
              Sign in to your account
            </h2>
            {/* <p className="mt-2 text-sm/6 text-weak">
              Forgot your password?{" "}
              <a
                href="/auth/set-password"
                className="font-semibold text-brand hover:underline"
              >
                Reset it here
              </a>
            </p> */}
          </div>

          <div className="mt-10">
            <div>
              <LoginForm />
            </div>

            {/* <div className="mt-10">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="w-full border-t border-stroke-weak" />
                </div>
                <div className="relative flex justify-center text-sm/6 font-medium">
                  <span className="bg-white px-6 text-strong">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleLoginButton />
            </div> */}
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt=""
          src="/auth/login-feature-2.jpeg"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
  );
};

export default page;
