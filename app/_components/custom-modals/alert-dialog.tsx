import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  size?: "sm" | "md" | "lg";
  showCancel?: boolean;
  className?: string;
}

const AlertDialogComponent: React.FC<AlertDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  trigger,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  size = "md",
  showCancel = true,
  className,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          title: "text-red-900",
          description: "text-red-700",
        };
      case "warning":
        return {
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          title: "text-yellow-900",
          description: "text-yellow-700",
        };
      case "success":
        return {
          confirmButton: "bg-green-600 hover:bg-green-700 text-white",
          title: "text-green-900",
          description: "text-green-700",
        };
      default:
        return {
          confirmButton: "bg-brand hover:bg-brand/80 text-white",
          title: "text-gray-900",
          description: "text-gray-600",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-lg";
      default:
        return "max-w-md";
    }
  };

  const styles = getVariantStyles();
  const sizeClass = getSizeStyles();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className={cn(sizeClass, className)}>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={cn("text-lg font-semibold", styles.title)}
          >
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription
              className={cn("text-sm", styles.description)}
            >
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel
              onClick={handleCancel}
              className="border-gray-300 hover:bg-gray-50"
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn("font-medium", styles.confirmButton)}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Pre-configured alert dialog variants
export const DestructiveAlertDialog = (
  props: Omit<AlertDialogProps, "variant">
) => <AlertDialogComponent {...props} variant="destructive" />;

export const WarningAlertDialog = (
  props: Omit<AlertDialogProps, "variant">
) => <AlertDialogComponent {...props} variant="warning" />;

export const SuccessAlertDialog = (
  props: Omit<AlertDialogProps, "variant">
) => <AlertDialogComponent {...props} variant="success" />;

// Utility function to create alert dialogs with button triggers
export const createAlertDialog = (
  buttonText: string,
  buttonVariant:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive" = "outline",
  buttonSize: "default" | "sm" | "lg" | "icon" = "sm"
) => {
  return (props: Omit<AlertDialogProps, "trigger">) => (
    <AlertDialogComponent
      {...props}
      trigger={
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonText}
        </Button>
      }
    />
  );
};

// Common alert dialog patterns
export const DeleteAlertDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  itemName = "this item",
  ...props
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  itemName?: string;
} & Omit<
  AlertDialogProps,
  | "isOpen"
  | "onOpenChange"
  | "onConfirm"
  | "title"
  | "description"
  | "variant"
  | "confirmText"
>) => (
  <DestructiveAlertDialog
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    title="Delete Confirmation"
    description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
    onConfirm={onConfirm}
    confirmText="Delete"
    cancelText="Cancel"
    {...props}
  />
);

export const UnsavedChangesAlertDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  ...props
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
} & Omit<
  AlertDialogProps,
  | "isOpen"
  | "onOpenChange"
  | "onConfirm"
  | "onCancel"
  | "title"
  | "description"
  | "variant"
  | "confirmText"
  | "cancelText"
>) => (
  <WarningAlertDialog
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    title="Unsaved Changes"
    description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
    onConfirm={onConfirm}
    onCancel={onCancel}
    confirmText="Leave"
    cancelText="Stay"
    {...props}
  />
);

export default AlertDialogComponent;
