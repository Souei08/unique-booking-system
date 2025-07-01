"use client";

import { useState } from "react";

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    timezone: "Pacific Standard Time",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log("Profile updated:", profile);
  };

  return (
    <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10  py-16  md:grid-cols-3">
      <div>
        <h2 className="text-base/7 font-semibold text-strong">
          Personal Information
        </h2>
        <p className="mt-1 text-sm/6 text-weak">
          Use a permanent address where you can receive mail.
        </p>
      </div>

      <form className="md:col-span-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div className="col-span-full flex items-center gap-x-8">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="size-24 flex-none rounded-lg bg-neutral object-cover"
            />
            <div>
              <button
                type="button"
                className="rounded-md bg-brand/10 px-3 py-2 text-sm font-semibold text-brand shadow-xs hover:bg-brand/20"
              >
                Change avatar
              </button>
              <p className="mt-2 text-xs/5 text-weak">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="first-name"
              className="block text-sm/6 font-medium text-strong"
            >
              First name
            </label>
            <div className="mt-2">
              <input
                id="first-name"
                name="first-name"
                type="text"
                autoComplete="given-name"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="last-name"
              className="block text-sm/6 font-medium text-strong"
            >
              Last name
            </label>
            <div className="mt-2">
              <input
                id="last-name"
                name="last-name"
                type="text"
                autoComplete="family-name"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-strong"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="block w-full rounded-md bg-background border border-stroke-weak px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-brand/10 placeholder:text-weak focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="username"
              className="block text-sm/6 font-medium text-strong"
            >
              Username
            </label>
            <div className="mt-2">
              <div className="flex items-center rounded-md bg-background border border-stroke-weak pl-3 outline-1 -outline-offset-1 outline-brand/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-brand">
                <div className="shrink-0 text-base text-weak select-none sm:text-sm/6">
                  example.com/
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="janesmith"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-text placeholder:text-weak focus:outline-none sm:text-sm/6"
                />
              </div>
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="timezone"
              className="block text-sm/6 font-medium text-strong"
            >
              Timezone
            </label>
            <div className="mt-2 grid grid-cols-1">
              <select
                id="timezone"
                name="timezone"
                value={profile.timezone}
                onChange={(e) =>
                  setProfile({ ...profile, timezone: e.target.value })
                }
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-background border border-stroke-weak py-1.5 pr-8 pl-3 text-base text-text outline-1 -outline-offset-1 outline-brand/10 *:bg-neutral focus:outline-2 focus:-outline-offset-2 focus:outline-brand sm:text-sm/6"
              >
                <option>Pacific Standard Time</option>
                <option>Eastern Standard Time</option>
                <option>Greenwich Mean Time</option>
              </select>
              <svg
                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-weak sm:size-4"
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
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
