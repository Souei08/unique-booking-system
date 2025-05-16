"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

export function CreateUserDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add User
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1000px] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          {/* Add your user form component here */}
          {/* <UserForm
            onSuccess={() => setIsOpen(false)}
          /> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
