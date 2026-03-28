"use client";

import Header from "@/components/layout/Header";
import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" backHref="/" />
      <div className="mx-auto max-w-lg p-4 pb-28">
        <SettingsForm />
      </div>
    </>
  );
}
