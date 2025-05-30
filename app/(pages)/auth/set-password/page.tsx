"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CompanyLogo from "@/app/_components/common/logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Parse token fragment and set Supabase session
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (access_token && refresh_token && type === "recovery") {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (!error) {
            setIsAuthenticated(true);
            // Optionally clean up the URL
            window.history.replaceState(
              {},
              document.title,
              "/auth/reset-password"
            );
          } else {
            setError("Failed to authenticate reset token.");
          }
        });
    }
  }, []);

  const handleRequestReset = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/set-password`,
        }
      );

      if (resetError) {
        setError("Error sending reset email: " + resetError.message);
      } else {
        setSuccess("Password reset instructions have been sent to your email");
      }
    } catch {
      setError("An unexpected error occurred");
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password,
      });

      if (resetError) {
        setError("Error resetting password: " + resetError.message);
      } else {
        setSuccess("Password successfully reset!");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch {
      setError("An unexpected error occurred");
    }

    setLoading(false);
  };

  const renderResetForm = () => (
    <>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-strong"
        >
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your new password"
          className="block w-full mt-2 rounded-md border-0 py-1.5 text-strong shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-brand sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-strong"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          className="block w-full mt-2 rounded-md border-0 py-1.5 text-strong shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-brand sm:text-sm"
        />
      </div>
    </>
  );

  const renderEmailForm = () => (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-strong">
        Email Address
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="block w-full mt-2 rounded-md border-0 py-1.5 text-strong shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-brand sm:text-sm"
      />
    </div>
  );

  return (
    <div className="flex h-screen">
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt="Reset background"
          src="/auth/register-feature-img.jpeg"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-center px-6 py-12 w-full max-w-md mx-auto">
        <CompanyLogo />
        <h2 className="mt-8 text-2xl font-bold text-strong">
          {isAuthenticated ? "Reset Your Password" : "Request Password Reset"}
        </h2>
        <p className="mt-2 text-sm text-weak">
          {isAuthenticated
            ? "Please enter your new password below."
            : "Enter your email address to receive password reset instructions."}
        </p>

        <div className="mt-8 space-y-6">
          {isAuthenticated ? renderResetForm() : renderEmailForm()}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            onClick={isAuthenticated ? handleResetPassword : handleRequestReset}
            disabled={loading}
            className="w-full bg-brand text-white py-2 rounded-md font-semibold hover:bg-brand/90"
          >
            {loading
              ? isAuthenticated
                ? "Resetting..."
                : "Sending..."
              : isAuthenticated
              ? "Reset Password"
              : "Send Reset Instructions"}
          </button>
        </div>
      </div>
    </div>
  );
}
