"use client";

import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export function TourHeader() {
  return (
    <header className="relative">
      <nav aria-label="Top">
        {/* Top navigation */}
        <div className="bg-gray-900">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <p className="flex-1 text-center text-sm font-medium text-white lg:flex-none">
              Get free delivery on orders over $100
            </p>

            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
              <a
                href="#"
                className="text-sm font-medium text-white hover:text-gray-100"
              >
                Create an account
              </a>
              <span aria-hidden="true" className="h-6 w-px bg-gray-600" />
              <a
                href="#"
                className="text-sm font-medium text-white hover:text-gray-100"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>

        {/* Secondary navigation */}
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="border-b border-gray-200">
              <div className="flex h-16 items-center justify-between">
                {/* Logo (lg+) */}
                <div className="hidden lg:flex lg:items-center">
                  <a href="/">
                    <span className="sr-only">Unique Tour And Rentals</span>
                    <img
                      alt=""
                      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                      className="h-8 w-auto"
                    />
                  </a>
                </div>

                <div className="hidden h-full lg:flex">
                  {/* Navigation links */}
                  <div className="ml-8">
                    <div className="flex h-full justify-center space-x-8">
                      <a
                        href="/tours"
                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Tours
                      </a>
                      <a
                        href="/rentals"
                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Rentals
                      </a>
                      <a
                        href="/about"
                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        About
                      </a>
                      <a
                        href="/contact"
                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Contact
                      </a>
                    </div>
                  </div>
                </div>

                {/* Mobile menu and search (lg-) */}
                <div className="flex flex-1 items-center lg:hidden">
                  <button
                    type="button"
                    className="-ml-2 rounded-md bg-white p-2 text-gray-400"
                  >
                    <span className="sr-only">Open menu</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  </button>

                  {/* Search */}
                  <a
                    href="#"
                    className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Search</span>
                    <MagnifyingGlassIcon
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  </a>
                </div>

                {/* Logo (lg-) */}
                <a href="/" className="lg:hidden">
                  <span className="sr-only">Unique Tour And Rentals</span>
                  <img
                    alt=""
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                  />
                </a>

                <div className="flex flex-1 items-center justify-end">
                  <div className="flex items-center lg:ml-8">
                    <div className="flex space-x-8">
                      <div className="hidden lg:flex">
                        <a
                          href="#"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Search</span>
                          <MagnifyingGlassIcon
                            className="h-6 w-6"
                            aria-hidden="true"
                          />
                        </a>
                      </div>

                      <div className="flex">
                        <a
                          href="#"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Account</span>
                          <UserIcon className="h-6 w-6" aria-hidden="true" />
                        </a>
                      </div>
                    </div>

                    <span
                      aria-hidden="true"
                      className="mx-4 h-6 w-px bg-gray-200 lg:mx-6"
                    />

                    <div className="flow-root">
                      <a href="#" className="group -m-2 flex items-center p-2">
                        <ShoppingCartIcon
                          className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                          0
                        </span>
                        <span className="sr-only">items in cart, view bag</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
