"use server";

import { createClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";

interface UpdateUserData {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
}

export async function updateUserServerAction(data: UpdateUserData) {
  const { user_id, first_name, last_name, role, phone_number } = data;

  try {
    // Get the current user to check if they are admin
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if current user is admin
    const { data: currentUserRole, error: roleError } = await supabase.rpc(
      "get_user_role",
      { user_id: user.id }
    );

    if (roleError || currentUserRole !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    // Validate input data
    if (!user_id || !first_name || !last_name || !role) {
      return {
        success: false,
        error: "Required fields: user_id, first_name, last_name, role",
      };
    }

    if (first_name.length < 2 || last_name.length < 2) {
      return {
        success: false,
        error: "Names must be at least 2 characters long",
      };
    }

    if (!["reservation_agent", "reseller", "ADMIN"].includes(role)) {
      return { success: false, error: "Invalid role specified" };
    }

    // Combine first_name and last_name into full_name
    const full_name = `${first_name} ${last_name}`.trim();

    // Update the user in the users table
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        full_name,
        role,
        phone_number,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user_id);

    if (updateError) {
      console.error("User update failed:", updateError);
      return { success: false, error: "Failed to update user" };
    }

    // Update the user metadata in auth.users table
    const { error: authUpdateError } =
      await supabaseAdmin.auth.admin.updateUserById(user_id, {
        user_metadata: {
          full_name,
          first_name,
          last_name,
          role,
          phone_number,
        },
      });

    if (authUpdateError) {
      console.error("Auth user update failed:", authUpdateError);
      // Don't fail the entire operation if auth update fails
      // The user table update was successful
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
