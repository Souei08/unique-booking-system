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

export async function getUserWithProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  try {
    // Get complete user data from the database
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("supabase_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      // Return basic user data if profile fetch fails
      return {
        ...user,
        role: null,
        first_name: "",
        last_name: "",
        full_name: "",
        phone_number: "",
      };
    }

    return {
      ...user,
      ...userProfile,
    };
  } catch (error) {
    console.error("Error in getUserWithProfile function:", error);
    // Return user without profile data rather than failing completely
    return {
      ...user,
      role: null,
      first_name: "",
      last_name: "",
      full_name: "",
      phone_number: "",
    };
  }
}

export async function updateUserProfile(data: {
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // Combine first_name and last_name into full_name
    const full_name = `${data.first_name} ${data.last_name}`.trim();

    // Update the user in the users table
    const { error: updateError } = await supabase
      .from("users")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        full_name,
        email: data.email,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("supabase_id", user.id);

    if (updateError) {
      console.error("User profile update failed:", updateError);
      return { success: false, error: "Failed to update profile" };
    }

    // Update the user metadata in auth.users table
    const { error: authUpdateError } = await supabase.auth.updateUser({
      email: data.email,
      data: {
        full_name,
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: data.avatar_url,
      },
    });

    if (authUpdateError) {
      console.error("Auth user update failed:", authUpdateError);
      // Don't fail the entire operation if auth update fails
      // The user table update was successful
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function uploadProfileImage(file: File): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Authentication required");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `profile-${user.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file);

  if (uploadError) {
    throw new Error("Failed to upload image");
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return publicUrlData?.publicUrl || "";
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  const supabase = await createClient();

  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage.from("avatars").remove([fileName]);

    if (error) {
      console.error("Error deleting profile image:", error);
    }
  } catch (error) {
    console.error("Error deleting profile image:", error);
  }
}
