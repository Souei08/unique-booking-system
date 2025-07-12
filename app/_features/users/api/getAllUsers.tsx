import { createClient } from "@/supabase/server";

export async function getAllUsers() {
  try {
    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from("users_with_auth")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { users, error: null };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: null, error };
  }
}
