"use client";

import axios from "axios";

import { useState } from "react";

import AuthForm from "./authForm";

import { registerSchema, RegisterFormValues } from "../validation";

import { showErrorToast } from "@/utils/toastUtils";

import { signUp } from "@/lib/auth";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const handleRegistration = async (data: RegisterFormValues) => {
    const { email, password } = data;

    setLoading(true); // Set loading to true when registration starts
    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        // Alert the error message through toast
        showErrorToast(error.message);
        // Send the error message to the AuthForm for validation display
        throw new Error(error.message);
      }

      console.log("Registration successful:", data);
    } catch (error) {
      // Handle any unexpected errors
      console.error("An unexpected error occurred:", error);
      showErrorToast("An unexpected error occurred. Please try again.");
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
