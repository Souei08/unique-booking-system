import { Path } from "react-hook-form";

export interface AuthFormField {
  name: string;
  type: string;
  placeholder: string;
  label: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends LoginFormValues {
  confirmPassword: string;
}

export const loginFields: AuthFormField[] = [
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
];

export const registerFields: AuthFormField[] = [
  ...loginFields,
  {
    name: "confirmPassword",
    type: "password",
    placeholder: "Confirm your password",
    label: "Confirm Password",
  },
];
