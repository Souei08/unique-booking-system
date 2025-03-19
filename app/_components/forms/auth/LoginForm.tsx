"use client";
import { loginSchema, LoginFormValues } from "../validation";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";
import AuthForm from "./authForm";
import { signIn } from "@/lib/auth";

export default function LoginForm() {
  const handleLogin = async (data: LoginFormValues) => {
    try {
      const { email, password } = data;
      const { error } = await signIn(email, password);

      if (error) {
        // Alert the error message through toast
        showErrorToast(error.message);
        // Send the error message to the AuthForm for validation display
        throw new Error(error.message);
      }

      showSuccessToast("Login successful!");
    } catch {
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
