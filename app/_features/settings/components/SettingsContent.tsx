"use client";

import { useState } from "react";
import ProfileSettings from "./ProfileSettings";
import PasswordSettings from "./PasswordSettings";
import SecuritySettings from "./SecuritySettings";

const secondaryNavigation = [
  { name: "Account", href: "#account", current: true },
  { name: "Security", href: "#security", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("account");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <>
            <ProfileSettings />
            <div className="border-t border-stroke-weak">
              <PasswordSettings />
            </div>
          </>
        );
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-full bg-white mt-7 p-6 rounded-lg">
      <header className="border-b border-stroke-weak">
        {/* Secondary navigation */}
        <nav className="flex overflow-x-auto py-4">
          <ul
            role="list"
            className="flex min-w-full flex-none gap-x-6 text-sm/6 font-semibold text-weak"
          >
            {secondaryNavigation.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleTabChange(item.name.toLowerCase())}
                  className={classNames(
                    activeTab === item.name.toLowerCase()
                      ? "text-brand"
                      : "text-weak hover:text-strong",
                    "cursor-pointer"
                  )}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Settings forms */}
      <div className="divide-y divide-stroke-weak">{renderContent()}</div>
    </div>
  );
}
