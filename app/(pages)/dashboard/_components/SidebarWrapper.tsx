"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      {children}
    </>
  );
}
