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

  const url = new URL(
    "/auth/callback",
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

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
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  try {
    // Try to get role from JWT claims first (if implemented)
    if (user.user_metadata?.role) {
      return {
        ...user,
        role: user.user_metadata.role,
      };
    }

    // Fallback to database query using the optimized RPC function
    const { data: userRole, error: roleError } = await supabase.rpc(
      "get_user_role",
      {
        user_id: user.id,
      }
    );

    if (roleError) {
      console.error("Error fetching user role:", roleError);
      // Return user without role rather than failing completely
      return {
        ...user,
        role: null,
      };
    }

    return {
      ...user,
      role: userRole,
    };
  } catch (error) {
    console.error("Error in getUser function:", error);
    // Return user without role rather than failing completely
    return {
      ...user,
      role: null,
    };
  }
}
