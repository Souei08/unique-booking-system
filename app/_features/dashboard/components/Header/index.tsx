"use client";

import { Bars3CenterLeftIcon } from "@heroicons/react/24/outline";

import { SearchBar } from "./SearchBar";
import { UserMenu } from "./UserMenu";

import { useSidebar } from "@/app/context/SidebarContext/useSidebar";

interface HeaderProps {
  user: any;
}

export const Header = ({ user }: HeaderProps) => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 z-10 flex h-16 shrink-0 border-b border-gray-200 bg-white">
      <button
        type="button"
        onClick={toggleSidebar}
        className="border-r border-gray-200 px-4 text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-hidden focus:ring-inset lg:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3CenterLeftIcon aria-hidden="true" className="size-6" />
      </button>
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <SearchBar />
        <UserMenu user={user} />
      </div>
    </div>
  );
};

export default Header;
