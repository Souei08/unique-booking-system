import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Navigation } from "./Navigation";
import { TeamsList } from "./TeamsList";
import { UserProfile } from "./UserProfile";

import type { NavigationItem } from "../shared/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  // teams: Team[];
}

const Sidebar = ({ isOpen, onClose, navigation }: SidebarProps) => {
  return (
    <>
      {/* Mobile sidebar */}
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-600/75 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs flex-1 transform flex-col bg-white pt-5 pb-4 transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 right-0 -mr-12 pt-2 duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={onClose}
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
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=purple&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <Navigation navigation={navigation} />
              {/* <TeamsList teams={teams} /> */}
            </div>
          </DialogPanel>
          <div aria-hidden="true" className="w-14 shrink-0" />
        </div>
      </Dialog>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-100 lg:pt-5 lg:pb-4">
        <div className="flex shrink-0 items-center px-6">
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=purple&shade=500"
            className="h-8 w-auto"
          />
        </div>
        <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
          <UserProfile />
          <Navigation navigation={navigation} />
          {/* <TeamsList teams={teams} /> */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
