"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { error, data: user } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, user };
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  const url = new URL("/auth/callback", process.env.NEXT_PUBLIC_URL);
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: url.toString(),
    },
  });

  if (error) {
    console.error("Error during Google login:", error);
    return;
  }

  revalidatePath("/", "layout");
  redirect(data.url);
}

export async function signup(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error during signout:", error);
    return;
  }

  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userRole } = await supabase
    .from("users")
    .select("role")
    .eq("supabase_id", user?.id)
    .single();

  return {
    ...user,
    role: userRole?.role,
  };
}
