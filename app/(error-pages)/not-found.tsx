import Link from "next/link";

export default function Example() {
  return (
    <main className="grid h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-brand">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-strong sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-weak sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10">
          <Link
            href="/auth/login"
            className="rounded-md bg-brand px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
