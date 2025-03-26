"use client";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="grid h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-brand">403</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-strong sm:text-7xl">
          Forbidden
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-weak sm:text-xl/8">
          You don't have permission to access this page.
        </p>
        <div className="mt-10">
          <Link
            href="/dashboard/customers"
            className="rounded-md bg-brand px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
