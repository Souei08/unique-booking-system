"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import AlertDialogComponent, {
  DestructiveAlertDialog,
  WarningAlertDialog,
  SuccessAlertDialog,
  DeleteAlertDialog,
  UnsavedChangesAlertDialog,
  createAlertDialog,
} from "./alert-dialog";

// Basic alert dialog example
export const BasicAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Action confirmed!");
    // Perform the action here
  };

  return (
    <AlertDialogComponent
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Basic Alert Dialog"
      description="This is a basic alert dialog with default styling."
      trigger={<Button>Open Basic Alert</Button>}
      onConfirm={handleConfirm}
      confirmText="Proceed"
      cancelText="Cancel"
    />
  );
};

// Destructive alert dialog example
export const DestructiveAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    console.log("Item deleted!");
    // Handle deletion logic
  };

  return (
    <DestructiveAlertDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Delete Item"
      description="Are you sure you want to delete this item? This action cannot be undone."
      trigger={
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Item
        </Button>
      }
      onConfirm={handleDelete}
      confirmText="Delete"
      cancelText="Cancel"
    />
  );
};

// Warning alert dialog example
export const WarningAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleProceed = () => {
    console.log("Proceeding with action...");
    // Handle the action
  };

  return (
    <WarningAlertDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Warning"
      description="This action may have unintended consequences. Are you sure you want to proceed?"
      trigger={
        <Button variant="outline" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Show Warning
        </Button>
      }
      onConfirm={handleProceed}
      confirmText="Proceed Anyway"
      cancelText="Cancel"
    />
  );
};

// Success alert dialog example
export const SuccessAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Action completed successfully!");
    // Handle success action
  };

  return (
    <SuccessAlertDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Success"
      description="Your action has been completed successfully. Would you like to continue?"
      trigger={
        <Button variant="outline" size="sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Show Success
        </Button>
      }
      onConfirm={handleConfirm}
      confirmText="Continue"
      cancelText="Close"
    />
  );
};

// Delete alert dialog with custom item name
export const DeleteAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    console.log("Product deleted!");
    // Handle product deletion
  };

  return (
    <DeleteAlertDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      itemName="this product"
      trigger={
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Product
        </Button>
      }
      onConfirm={handleDelete}
    />
  );
};

// Unsaved changes alert dialog
export const UnsavedChangesAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLeave = () => {
    console.log("Leaving without saving...");
    // Navigate away or discard changes
  };

  const handleStay = () => {
    console.log("Staying on current page...");
    // Stay on current page
  };

  return (
    <UnsavedChangesAlertDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant="outline" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Try to Leave
        </Button>
      }
      onConfirm={handleLeave}
      onCancel={handleStay}
    />
  );
};

// Alert dialog with custom size
export const CustomSizeAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Large dialog action confirmed!");
  };

  return (
    <AlertDialogComponent
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Large Alert Dialog"
      description="This is a large alert dialog with more space for content. It's perfect for longer descriptions or when you need to display more information."
      trigger={<Button variant="secondary">Large Dialog</Button>}
      onConfirm={handleConfirm}
      size="lg"
      confirmText="Confirm"
      cancelText="Cancel"
    />
  );
};

// Alert dialog without cancel button
export const NoCancelAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Action confirmed!");
  };

  return (
    <AlertDialogComponent
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Information"
      description="This is an informational alert dialog with only a confirm button."
      trigger={
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Show Info
        </Button>
      }
      onConfirm={handleConfirm}
      showCancel={false}
      confirmText="Got it"
    />
  );
};

// Using createAlertDialog utility
export const CreateAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const CustomAlertDialog = createAlertDialog(
    "Custom Button",
    "default",
    "default"
  );

  const handleConfirm = () => {
    console.log("Custom alert dialog confirmed!");
  };

  return (
    <CustomAlertDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Custom Alert Dialog"
      description="This alert dialog was created using the createAlertDialog utility function."
      onConfirm={handleConfirm}
      confirmText="Proceed"
      cancelText="Cancel"
    />
  );
};

// Programmatic control example
export const ProgrammaticAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Programmatic alert confirmed!");
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsOpen(true)}>
        Open Alert Dialog Programmatically
      </Button>

      <AlertDialogComponent
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Programmatic Alert"
        description="This alert dialog is controlled programmatically without a trigger."
        onConfirm={handleConfirm}
        confirmText="OK"
        cancelText="Cancel"
      />
    </div>
  );
};

// Alert dialog with custom styling
export const CustomStyledAlertDialogExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Custom styled alert confirmed!");
  };

  return (
    <AlertDialogComponent
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Custom Styled Alert"
      description="This alert dialog has custom styling applied."
      trigger={<Button variant="outline">Custom Styled</Button>}
      onConfirm={handleConfirm}
      className="border-blue-200 bg-blue-50"
      confirmText="Confirm"
      cancelText="Cancel"
    />
  );
};
