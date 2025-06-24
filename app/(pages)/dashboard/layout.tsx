import Sidebar from "@/app/_features/dashboard/components/Sidebar";
import Header from "@/app/_features/dashboard/components/Header";
import { getUser } from "@/app/_api/actions/auth/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="min-h-full">
      {/* Sidebar: hidden on small screens, visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>
      <div className="lg:pl-64">
        {/* Header: visible on mobile/tablet, hidden on lg+ */}
        <div className="lg:hidden">
          <Header user={user} />
        </div>
        <div className="bg-neutral">{children}</div>
      </div>
    </div>
  );
}
