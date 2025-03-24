"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";

import { XMarkIcon } from "@heroicons/react/24/outline";

import { Navigation } from "./Navigation";
import { UserProfile } from "./UserProfile";

import CompanyLogo from "@/app/_components/common/logo";
import { useSidebar } from "@/app/context/SidebarContext/useSidebar";

interface SidebarProps {
  user: any;
}

const Sidebar = ({ user }: SidebarProps) => {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={toggleSidebar}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 transition-opacity duration-300 ease-linear data-closed:opacity-0 bg-gray-800/75"
        />

        <div className="fixed inset-0 z-40 flex ">
          <DialogPanel
            transition
            className="relative shadow-lg border-r border-gray-200 flex w-full max-w-xs flex-1 transform flex-col bg-white pt-5 pb-4 transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 right-0 -mr-12 pt-2 duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="relative ml-1 flex size-10 items-center justify-center rounded-full focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            <div className="flex shrink-0 items-center px-4">
              <img
                alt="Your Company"
                src="/logo/unique_logo-removebg-preview-2.png"
                className="h-8 w-auto"
              />
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <Navigation />
            </div>
          </DialogPanel>
          <div aria-hidden="true" className="w-14 shrink-0" />
        </div>
      </Dialog>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r lg:border-gray-200  lg:pt-5 lg:pb-6">
        <div className="flex shrink-0 items-center px-6">
          <CompanyLogo />
        </div>
        <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
          <Navigation />
          <UserProfile user={user} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
