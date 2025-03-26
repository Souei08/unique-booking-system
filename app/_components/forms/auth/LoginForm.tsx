"use client";

import { useRouter } from "next/navigation";

import { loginSchema, LoginFormValues } from "../validation";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

import AuthForm from "./authForm";

import { login } from "@/app/actions/auth/actions";

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = async (data: LoginFormValues) => {
    try {
      const { email, password } = data;
      const result = await login(email, password);

      if (!result.success) {
        // Handle specific error cases
        if (result.error?.includes("Invalid login credentials")) {
          throw {
            fieldErrors: {
              email: "Invalid email or password",
              password: "Invalid email or password",
            },
          };
        }

        showErrorToast(
          result.error ?? "An unexpected error occurred. Please try again."
        );
        return;
      }

      showSuccessToast("Login successful!");
      router.push("/"); // Redirect to home or dashboard
    } catch (error: any) {
      if (error.fieldErrors) {
        throw error; // Re-throw field errors to be handled by AuthForm
      }
      console.error("An unexpected error occurred:", error);
      showErrorToast("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <AuthForm<LoginFormValues>
      schema={loginSchema}
      onSubmit={handleLogin}
      fields={[
        {
          name: "email",
          type: "email",
          placeholder: "Enter your email",
          label: "Email",
        },
        {
          name: "password",
          type: "password",
          placeholder: "Enter your password",
          label: "Password",
        },
      ]}
      buttonText="Login"
    />
  );
}
