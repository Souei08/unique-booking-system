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

  const [status, setStatus] = useState<"verifying" | "verified" | "error">(
    "verifying"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function handleInviteVerification() {
      try {
        const token_hash = searchParams.get("token_hash");

        console.log("token_hash", token_hash);

        if (!token_hash) {
          setStatus("error");
          setErrorMessage("Missing invite token.");
          return;
        }

        console.log("token_hash", token_hash);

        // Sign out current user to prevent auth conflicts
        // await supabase.auth.signOut();

        // Verify the invite token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token_hash,
          type: "email",
        });

        if (error) {
          console.error("[verifyOtp error]", error);
          setStatus("error");
          setErrorMessage(
            error.message || "Invite verification failed or expired."
          );
        } else {
          setStatus("verified");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          "An error occurred while processing the invite. Please try again."
        );
        console.error("Invite processing error:", err);
      }
    }

    handleInviteVerification();
  }, [searchParams, supabase.auth]);

  const handleSetPassword = async () => {
    setPasswordError("");
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordError(error.message);
    } else {
      setSuccessMessage("Password set successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }

    setLoading(false);
  };

  if (status === "verifying") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-medium">Verifying your invite...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-medium text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Set your password</h1>
        <p className="text-sm text-gray-600">
          Your invite is valid. Please choose a secure password to complete your
          account.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <label className="block text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <button
            onClick={handleSetPassword}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Setting..." : "Set Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
