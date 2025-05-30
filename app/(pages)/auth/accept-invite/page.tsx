// app/auth/accept-invite/page.tsx
"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";
export const preferredRegion = "auto";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleInviteRedirect() {
      try {
        const confirmationUrl = searchParams.get("confirmation_url");

        // Sign out current user to prevent auth conflicts
        await supabase.auth.signOut();

        if (confirmationUrl) {
          window.location.href = confirmationUrl;
        } else {
          router.replace("/auth/login");
        }
      } catch (err) {
        setError(
          "An error occurred while processing the invite. Please try again."
        );
        console.error("Invite processing error:", err);
      }
    }

    handleInviteRedirect();
  }, [searchParams, router, supabase.auth]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-medium text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg font-medium">Redirecting to confirmation link...</p>
    </div>
  );
}
