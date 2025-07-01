"use client";

import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
import { login } from "@/app/_api/actions/auth/actions";
import { loginSchema } from "../schema";
import { LoginFormValues, loginFields } from "../types";
import AuthForm from "./AuthForm";

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

      // Let the middleware handle the redirection based on user role
      // This ensures proper role-based routing
      router.push("/");
      router.refresh(); // Force a refresh to ensure middleware picks up the new session
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
      fields={loginFields}
      buttonText="Login"
    />
  );
}
