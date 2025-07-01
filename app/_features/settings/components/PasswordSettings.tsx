"use client";

import { useState } from "react";

export default function PasswordSettings() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
    console.log("Password change requested");
  };

  return (
    <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 py-16 md:grid-cols-3">
      <div>
        <h2 className="text-base/7 font-semibold text-strong">
          Change password
        </h2>
        <p className="mt-1 text-sm/6 text-weak">
          Update your password associated with your account.
        </p>
      </div>

      <form className="md:col-span-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div className="col-span-full">
            <label
              htmlFor="current-password"
              className="block text-sm/6 font-medium text-strong"
            >
              Current password
            </label>
            <div className="mt-2">
              <input
                id="current-password"
                name="current_password"
                type="password"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="new-password"
              className="block text-sm/6 font-medium text-strong"
            >
              New password
            </label>
            <div className="mt-2">
              <input
                id="new-password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="confirm-password"
              className="block text-sm/6 font-medium text-strong"
            >
              Confirm password
            </label>
            <div className="mt-2">
              <input
                id="confirm-password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex">
          <button
            type="submit"
            className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
