// app/actions/inviteUser.ts
"use server";

import supabaseAdmin from "@/supabase/admin";

export async function inviteUserServerAction(data: {
  email: string;
  full_name: string;
  role: string;
}) {
  const { email, full_name, role } = data;

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const redirectTo = `${siteUrl}/auth/accept-invite`;

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name,
      role,
    },
    redirectTo, // ✅ critical for your custom invite link
  });

  if (error) {
    console.log("error", error);

    console.error("Invite failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
