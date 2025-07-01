"use client";

import ContentLayout from "../ContentLayout";
import SettingsContent from "@/app/_features/settings/components/SettingsContent";

export default function SettingsPage() {
  return (
    <ContentLayout
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <SettingsContent />
    </ContentLayout>
  );
}
