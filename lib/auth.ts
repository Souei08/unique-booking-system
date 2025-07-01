import { createClient } from "../supabase/server";
import supabaseAdmin from "@/supabase/admin";

export const signUpWithEmail = async (email: string, password: string) => {
  const supabase = await createClient();

  return await supabase.auth.signUp({ email: email, password: password });
};

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = await createClient();
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signInWithGoogle = async () => {
  const supabase = await createClient();
  return await supabase.auth.signInWithOAuth({
    provider: "google",
  });
};

export const signOut = async () => {
  const supabase = await createClient();

  return await supabase.auth.signOut();
};

// /**
//  * Update user metadata with role information for JWT claims
//  * This can be called after user registration or role changes
//  */
// export async function updateUserRoleInMetadata(userId: string, role: string) {
//   try {
//     const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
//       user_metadata: { role },
//     });

//     if (error) {
//       console.error("Error updating user metadata:", error);
//       return false;
//     }

//     return true;
//   } catch (error) {
//     console.error("Error updating user metadata:", error);
//     return false;
//   }
// }

// /**
//  * Get user role with fallback strategies
//  */
// export async function getUserRoleWithFallback(userId: string) {
//   const supabase = await createClient();

//   // Try to get from JWT claims first
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (user?.user_metadata?.role) {
//     return user.user_metadata.role;
//   }

//   // Fallback to database query
//   const { data: userData, error } = await supabase.rpc("get_user_role", {
//     user_id: userId,
//   });

//   if (error || !userData) {
//     return null;
//   }

//   return userData;
// }

/**
 * Batch update user roles in metadata
 */
// export async function batchUpdateUserRoles() {
//   try {
//     // Get all users with their roles
//     const { data: users, error } = await supabaseAdmin
//       .from("users")
//       .select("supabase_id, role");

//     if (error) {
//       console.error("Error fetching users:", error);
//       return false;
//     }

//     // Update each user's metadata
//     for (const user of users) {
//       if (user.supabase_id && user.role) {
//         await updateUserRoleInMetadata(user.supabase_id, user.role);
//       }
//     }

//     return true;
//   } catch (error) {
//     console.error("Error in batch update:", error);
//     return false;
//   }
// }
