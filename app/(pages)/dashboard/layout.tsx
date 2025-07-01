"use client";

import Sidebar from "@/app/_features/dashboard/components/Sidebar";
import Header from "@/app/_features/dashboard/components/Header";
import { getUser } from "@/app/_api/actions/auth/actions";
import { useSidebar } from "@/app/context/SidebarContext/useSidebar";
import { useEffect, useState } from "react";
import { DashboardPageLoader } from "@/app/_components/common/DashboardLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  if (!user) {
    return <DashboardPageLoader />;
  }

  return (
    <div className="min-h-full">
      {/* Sidebar: hidden on small screens, visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        {/* Header: visible on mobile/tablet, hidden on lg+ */}
        <div className="lg:hidden">
          <Header user={user} />
        </div>
        <div className="bg-neutral">{children}</div>
      </div>
    </div>
  );
}
