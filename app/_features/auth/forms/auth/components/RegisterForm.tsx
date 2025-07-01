"use client";

import { useRouter } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { signup } from "@/app/_api/actions/auth/actions";
import { registerSchema } from "../schema";
import { RegisterFormValues, registerFields } from "../types";
import AuthForm from "./AuthForm";

export default function RegisterForm() {
  const router = useRouter();

  const handleRegistration = async (data: RegisterFormValues) => {
    const { email, password } = data;

    try {
      await signup(email, password);
      showSuccessToast("Registration successful!");
      router.push("/auth/login"); // Redirect to login page after successful registration
    } catch (error) {
      // Handle any unexpected errors
      console.error("An unexpected error occurred:", error);
      showErrorToast("Registration failed. Please try again.");
    }
  };

  return (
    <AuthForm<RegisterFormValues>
      schema={registerSchema}
      onSubmit={handleRegistration}
      fields={registerFields}
      buttonText="Register"
    />
  );
}
