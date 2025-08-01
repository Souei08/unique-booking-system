// app/actions/inviteUser.ts
"use server";

import supabaseAdmin from "@/supabase/admin";

export async function inviteUserServerAction(data: {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
}) {
  const { email, first_name, last_name, role, phone_number } = data;

  // Combine first_name and last_name into full_name
  const full_name = `${first_name} ${last_name}`.trim();

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const redirectTo = `${siteUrl}/auth/accept-invite`;

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name,
      first_name,
      last_name,
      role,
      phone_number,
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
