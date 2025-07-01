"use client";

import { useState } from "react";

export default function SecuritySettings() {
  const [logoutPassword, setLogoutPassword] = useState("");

  const handleLogoutOtherSessions = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle logout other sessions logic here
    console.log("Logging out other sessions");
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle account deletion logic here
    console.log("Account deletion requested");
  };

  return (
    <>
      {/* Log out other sessions */}
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 py-16 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-strong">
            Log out other sessions
          </h2>
          <p className="mt-1 text-sm/6 text-weak">
            Please enter your password to confirm you would like to log out of
            your other sessions across all of your devices.
          </p>
        </div>

        <form className="md:col-span-2" onSubmit={handleLogoutOtherSessions}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="logout-password"
                className="block text-sm/6 font-medium text-strong"
              >
                Your password
              </label>
              <div className="mt-2">
                <input
                  id="logout-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={logoutPassword}
                  onChange={(e) => setLogoutPassword(e.target.value)}
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
              Log out other sessions
            </button>
          </div>
        </form>
      </div>

      {/* Delete account */}
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-base/7 font-semibold text-strong">
            Delete account
          </h2>
          <p className="mt-1 text-sm/6 text-weak">
            No longer want to use our service? You can delete your account here.
            This action is not reversible. All information related to this
            account will be deleted permanently.
          </p>
        </div>

        <form
          className="flex items-start md:col-span-2"
          onSubmit={handleDeleteAccount}
        >
          <button
            type="submit"
            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-400"
          >
            Yes, delete my account
          </button>
        </form>
      </div>
    </>
  );
}
