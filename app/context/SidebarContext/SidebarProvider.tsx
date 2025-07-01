"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type SidebarContextType = {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
};

// ✅ Export SidebarContext separately
export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

// ✅ Default export is SidebarProvider
export default function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  function toggleCollapsed() {
    setIsCollapsed((prev) => !prev);
  }

  return (
    <SidebarContext.Provider
      value={{ isOpen, isCollapsed, toggleSidebar, toggleCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
