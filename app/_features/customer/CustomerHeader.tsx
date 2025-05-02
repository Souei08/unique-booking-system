"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useAuth } from "@/app/context/AuthContext/useAuth";
import { signOut } from "@/lib/auth";
import Image from "next/image";

const navigation = [{ name: "Tours", href: "/tours" }];

export default function CustomerHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/auth/login";
  };

  return (
    <header className="bg-background">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-6"
      >
        <a href="#" className="-m-1 p-1">
          <span className="sr-only">Your Company</span>
          <img
            alt=""
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="h-6 w-auto"
          />
        </a>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-gray-900"
            >
              {item.name}
            </a>
          ))}
          <a href="/auth/login" className="text-sm font-semibold text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-brand px-4 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1 p-1">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-6 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2 rounded-md p-2 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-4 flow-root">
            <div className="-my-4 divide-y divide-gray-500/10">
              <div className="space-y-2 py-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-2 block rounded-lg px-2 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              <div className="py-4">
                {/* <div className="space-y-2">
                    <div className="flex items-center gap-x-2 px-2">
                      <Image
                        alt={user.email}
                        src={
                          user.user_metadata?.avatar_url ||
                          "/default-avatar.png"
                        }
                        className="h-8 w-8 rounded-full"
                        width={32}
                        height={32}
                      />
                      <span className="text-base font-semibold text-gray-900">
                        {user.user_metadata?.name || user.email}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="-mx-2 block w-full rounded-lg px-2 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div> */}
                <a
                  href="/auth/login"
                  className="-mx-2 block rounded-lg px-2 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
