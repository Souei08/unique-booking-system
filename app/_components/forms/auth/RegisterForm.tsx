"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";

import AuthForm from "./authFormDesign";

import { registerSchema, RegisterFormValues } from "../validation";

import { showErrorToast, showSuccessToast } from "@/utils/toastUtils";

import { signup } from "@/app/actions/auth/actions";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleRegistration = async (data: RegisterFormValues) => {
    const { email, password } = data;

    setLoading(true); // Set loading to true when registration starts
    try {
      await signup(email, password);

      showSuccessToast("Registration successful!");
    } catch (error) {
      // Handle any unexpected errors
      console.error("An unexpected error occurred:", error);
    } finally {
      setLoading(false); // Set loading to false when registration is complete
    }
  };

  return (
    <AuthForm<RegisterFormValues>
      schema={registerSchema}
      onSubmit={handleRegistration}
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
        {
          name: "confirmPassword",
          type: "password",
          placeholder: "Confirm your password",
          label: "Confirm Password",
        },
      ]}
      buttonText={loading ? "Registering..." : "Register"}
    />
  );
}
