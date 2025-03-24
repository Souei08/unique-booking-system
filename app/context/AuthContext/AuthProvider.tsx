"use client";

import React, { createContext, ReactNode } from "react";

import { createClient } from "@/supabase/client";

// Define Auth Context Type
type AuthContextType = {
  user: any;
  role: string;
};

// Create Context (This is what `useAuth.ts` should import)
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Provider Component (This should only be used in `layout.tsx`)
export default async function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  // const supabase = createClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // let role = "guest"; // Default role
  // if (user) {
  //   const { data } = await supabase
  //     .from("users")
  //     .select("role")
  //     .eq("id", user.id)
  //     .single();
  //   role = data?.role || "guest";
  // }

  return (
    <AuthContext.Provider value={{ user: "", role: "" }}>
      {children}
    </AuthContext.Provider>
  );
}
