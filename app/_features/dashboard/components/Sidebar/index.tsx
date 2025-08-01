"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";

import {
  XMarkIcon,
  Bars3Icon,
  XMarkIcon as XMarkIconSolid,
} from "@heroicons/react/24/outline";

import { Navigation } from "./Navigation";

import CompanyLogo from "@/app/_components/common/logo";
import { useSidebar } from "@/app/context/SidebarContext/useSidebar";
import Image from "next/image";
import { UserProfile } from "./UserProfile";

interface SidebarProps {
  user: any;
}

const Sidebar = ({ user }: SidebarProps) => {
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapsed } = useSidebar();

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={toggleSidebar}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 transition-opacity duration-200 ease-out data-closed:opacity-0 bg-gray-800/75"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative shadow-lg border-r border-gray-200 flex w-full max-w-xs flex-1 transform flex-col bg-white pt-5 pb-4 transition duration-200 ease-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 right-0 -mr-12 pt-2 duration-200 ease-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="relative ml-1 flex size-10 items-center justify-center rounded-full focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            <div className="mx-auto">
              <Image
                alt="Wentech"
                src="/logo/wentech-logo-latest.png"
                // className="h-auto w-full object-cover"
                className="h-[100px] w-[100px] object-cover"
                width={400}
                height={200}
                style={{
                  objectPosition: "-0px",
                }}
              />
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <Navigation user={user} />
            </div>
          </DialogPanel>
          <div aria-hidden="true" className="w-14 shrink-0" />
        </div>
      </Dialog>

      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col border-r lg:border-gray-200 lg:pt-5 lg:pb-6 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-16" : "lg:w-64"
        }`}
      >
        {/* Floating collapse button */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-6 z-10 hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-colors duration-150"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Bars3Icon className="w-3 h-3 text-gray-600" />
          ) : (
            <XMarkIconSolid className="w-3 h-3 text-gray-600" />
          )}
        </button>

        {/* Logo section */}
        <div className="flex justify-center mb-4">
          {!isCollapsed ? (
            <Image
              alt="Wentech"
              src="/logo/wentech-logo-latest.png"
              className="h-[100px] w-[100px] object-cover"
              width={400}
              height={200}
              style={{
                objectPosition: "-0px",
              }}
            />
          ) : (
            <Image
              alt="Wentech"
              src="/logo/wentech-logo-latest.png"
              className="h-12 w-12 object-cover"
              width={48}
              height={48}
              style={{
                objectPosition: "-0px",
              }}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex h-0 flex-1 flex-col overflow-y-auto pt-1 hover:overflow-y-auto">
          <Navigation user={user} isCollapsed={isCollapsed} />
        </div>

        {/* User Profile */}
        <div className={`${isCollapsed ? "px-2" : "px-4"} mb-2 mt-auto`}>
          <UserProfile user={user} isCollapsed={isCollapsed} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
