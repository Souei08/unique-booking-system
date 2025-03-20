"use server";

import { createClient } from "@/supabase/server";
import { headers } from "next/headers";

export const signInAction = async (email: string, password: string) => {
  const supabase = await createClient();

  if (!email || !password) {
    console.log("Email and password are required");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: "dugayalagie@gmail.com",
    password: "test123",
  });

  if (error) {
    console.log(error.message);
  } else {
    console.log(
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};
