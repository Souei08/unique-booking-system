"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MainModal, {
  SmallModal,
  LargeModal,
  FullWidthModal,
  ConfirmationModal,
  createButtonModal,
} from "./main-modal";

// Example of using the base MainModal
export const BasicModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MainModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Basic Modal Example"
      trigger={<Button>Open Basic Modal</Button>}
    >
      <div className="space-y-4">
        <p>This is a basic modal with default styling.</p>
        <Button onClick={() => setIsOpen(false)}>Close</Button>
      </div>
    </MainModal>
  );
};

// Example of using SmallModal
export const SmallModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SmallModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Small Modal"
      trigger={
        <Button variant="outline" size="sm">
          Small Modal
        </Button>
      }
    >
      <p>This is a small modal perfect for confirmations or simple forms.</p>
    </SmallModal>
  );
};

// Example of using LargeModal
export const LargeModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LargeModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Large Modal"
      trigger={<Button variant="secondary">Large Modal</Button>}
    >
      <div className="space-y-4">
        <p>
          This is a large modal perfect for complex forms or detailed content.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter email" />
          </div>
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Enter your message" />
        </div>
      </div>
    </LargeModal>
  );
};

// Example of using ConfirmationModal
export const ConfirmationModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Action confirmed!");
    // Perform the action here
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Delete Item"
      message="Are you sure you want to delete this item? This action cannot be undone."
      onConfirm={handleConfirm}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
  );
};

// Example of using createButtonModal utility
export const ButtonModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Create a custom button modal
  const CustomButtonModal = createButtonModal(
    "Custom Button",
    "default",
    "default"
  );

  return (
    <CustomButtonModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Custom Button Modal"
    >
      <p>
        This modal was created using the createButtonModal utility function.
      </p>
    </CustomButtonModal>
  );
};

// Example of a form modal
export const FormModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsOpen(false);
  };

  return (
    <MainModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Contact Form"
      trigger={<Button>Open Contact Form</Button>}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </MainModal>
  );
};

// Example of a modal without a trigger (programmatically controlled)
export const ProgrammaticModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsOpen(true)}>Open Programmatic Modal</Button>

      <MainModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Programmatic Modal"
        showCloseButton={true}
      >
        <div className="space-y-4">
          <p>This modal is controlled programmatically without a trigger.</p>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </MainModal>
    </div>
  );
};

// Example of a modal with custom styling
export const CustomStyledModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MainModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Custom Styled Modal"
      trigger={<Button variant="destructive">Custom Styled</Button>}
      className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200"
      maxWidth="xl"
    >
      <div className="space-y-4">
        <p className="text-blue-800">
          This modal has custom styling applied through the className prop.
        </p>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <p className="text-gray-700">Content in a styled container</p>
        </div>
      </div>
    </MainModal>
  );
};

// Example of using the responsive modal
export const ResponsiveModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MainModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title="Responsive Modal"
      description="This modal adapts to different screen sizes"
      trigger={<Button variant="secondary">Responsive Modal</Button>}
      maxWidth="responsive"
    >
      <div className="space-y-4">
        <p>This modal uses responsive sizing:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Mobile</h4>
            <p className="text-sm text-gray-600">95% viewport width</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Small Screens</h4>
            <p className="text-sm text-gray-600">90% viewport width</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Medium Screens</h4>
            <p className="text-sm text-gray-600">800px max width</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Large Screens</h4>
            <p className="text-sm text-gray-600">1500px max width</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Height</h4>
            <p className="text-sm text-gray-600">95% viewport height</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Scrolling</h4>
            <p className="text-sm text-gray-600">Auto overflow handling</p>
          </div>
        </div>
      </div>
    </MainModal>
  );
};
