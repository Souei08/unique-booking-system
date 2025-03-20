"use client";

import { useRouter } from "next/navigation";

import { loginSchema, LoginFormValues } from "../validation";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

import AuthForm from "./authForm";

import { signInAction } from "./actions";

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = async (data: LoginFormValues) => {
    try {
      const { email, password } = data;
      const result = await signInAction(email, password);

      // if (error) {
      //   // Alert the error message through toast
      //   showErrorToast(error.message);
      //   // Send the error message to the AuthForm for validation display
      //   throw new Error(error.message);
      // }

      console.log(result);

      // router.push("/dashboard/customer");
    } catch (error) {
      console.error("An unexpected error occurred:", error);
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
