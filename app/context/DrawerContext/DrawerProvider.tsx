"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Drawer from "@/app/_components/common/drawer";

type DrawerContextType = {
  isOpen: boolean;
  drawerContent: React.ReactNode;
  drawerTitle?: string;
  openDrawer: (content: React.ReactNode, title?: string) => void;
  closeDrawer: () => void;
};

export const DrawerContext = createContext<DrawerContextType | undefined>(
  undefined
);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);
  const [drawerTitle, setDrawerTitle] = useState<string>();

  const openDrawer = (content: React.ReactNode, title?: string) => {
    setDrawerContent(content);
    setDrawerTitle(title);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    // Optional: Clear content after animation
    setTimeout(() => {
      setDrawerContent(null);
      setDrawerTitle(undefined);
    }, 500);
  };

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        drawerContent,
        drawerTitle,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
      <Drawer open={isOpen} onClose={closeDrawer} title={drawerTitle || ""}>
        {drawerContent}
      </Drawer>
    </DrawerContext.Provider>
  );
}
