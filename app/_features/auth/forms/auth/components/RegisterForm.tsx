"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";
import { signup } from "@/app/_api/actions/auth/actions";
import { registerSchema } from "../schema";
import { RegisterFormValues, registerFields } from "../types";
import AuthForm from "./AuthForm";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegistration = async (data: RegisterFormValues) => {
    const { email, password } = data;

    setLoading(true); // Set loading to true when registration starts
    try {
      await signup(email, password);
      showSuccessToast("Registration successful!");
      router.push("/login"); // Redirect to login page after successful registration
    } catch (error) {
      // Handle any unexpected errors
      console.error("An unexpected error occurred:", error);
      showErrorToast("Registration failed. Please try again.");
    } finally {
      setLoading(false); // Set loading to false when registration is complete
    }
  };

  return (
    <AuthForm<RegisterFormValues>
      schema={registerSchema}
      onSubmit={handleRegistration}
      fields={registerFields}
      buttonText={loading ? "Registering..." : "Register"}
    />
  );
}
