"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import UpsertTourV2 from "../../tours/forms/upsert-tour-v2/UpsertTourV2";
import { useRouter } from "next/navigation";

interface ContentLayoutProps {
  title: string;
  description: string;
  buttonText: string;
  children: React.ReactNode;
  navigation?: {
    type: "dialog" | "route";
    path?: string;
  };
}

const ContentLayout = ({
  title,
  description,
  buttonText,
  children,
  navigation = { type: "dialog" },
}: ContentLayoutProps) => {
  const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
  const router = useRouter();

  const handleButtonClick = () => {
    if (navigation.type === "route" && navigation.path) {
      router.push(navigation.path);
    } else {
      setIsTourDialogOpen(true);
    }
  };

  return (
    <main className="flex-1">
      <div className="px-4 sm:px-6 lg:px-8 py-10 min-h-dvh">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-h2 font-bold text-strong">{title}</h1>
            <p className="mt-2 text-lg text-weak">{description}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="block rounded-md bg-brand px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer"
              onClick={handleButtonClick}
            >
              {buttonText}
            </button>
          </div>
        </div>

        {children}
      </div>

      <Dialog open={isTourDialogOpen} onOpenChange={setIsTourDialogOpen}>
        <DialogContent
          className="max-w-7xl w-[1500px] max-h-[95vh] overflow-y-auto"
          style={{
            maxWidth: "1000px",
          }}
        >
          <DialogHeader>
            <DialogTitle>Create a new tour</DialogTitle>
          </DialogHeader>

          <UpsertTourV2 onSuccess={() => setIsTourDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ContentLayout;
