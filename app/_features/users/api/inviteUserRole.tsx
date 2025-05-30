// app/actions/inviteUser.ts
"use server";

import supabaseAdmin from "@/supabase/admin";

export async function inviteUserServerAction(data: {
  email: string;
  full_name: string;
  role: string;
}) {
  const { email, full_name, role } = data;

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password`,
  });

  if (error) {
    console.error("Invite failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
