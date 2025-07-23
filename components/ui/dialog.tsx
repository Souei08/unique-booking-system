"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  XIcon,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Default alert types
type AlertType = "success" | "error" | "warning" | "info" | "custom";

interface AlertConfig {
  icon?: React.ReactNode;
  title?: string;
  color?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "outline";
}

const defaultAlertConfigs: Record<AlertType, AlertConfig> = {
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    title: "Success",
    color: "green-600",
    message: "Operation completed successfully.",
    confirmText: "OK",
    cancelText: "Cancel",
    variant: "default",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    title: "Error",
    color: "red-600",
    message: "Something went wrong. Please try again.",
    confirmText: "OK",
    cancelText: "Cancel",
    variant: "destructive",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    title: "Warning",
    color: "yellow-600",
    message: "Are you sure you want to proceed?",
    confirmText: "Continue",
    cancelText: "Cancel",
    variant: "outline",
  },
  info: {
    icon: <Info className="h-5 w-5 text-brand" />,
    title: "Information",
    color: "brand",
    message: "Please review the information below.",
    confirmText: "OK",
    cancelText: "Cancel",
    variant: "default",
  },
  custom: {
    icon: <Info className="h-5 w-5 text-weak" />,
    title: "Confirm",
    color: "weak",
    message: "Are you sure you want to continue?",
    confirmText: "Yes",
    cancelText: "No",
    variant: "default",
  },
};

// Helper function to create custom alert configs
function createAlertConfig(config: Partial<AlertConfig>): AlertConfig {
  return {
    ...defaultAlertConfigs.custom,
    ...config,
  };
}

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40",
        className
      )}
      {...props}
    />
  );
}

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  closeIcon?: React.ReactNode;
  showCloseButton?: boolean;
  onCloseConfirm?: () => Promise<boolean> | boolean;
  alertType?: AlertType;
  alertConfig?: Partial<AlertConfig>;
  disableCloseOnOutside?: boolean;
  showCloseConfirmation?: boolean;
  closeConfirmationType?: AlertType;
  closeConfirmationTitle?: string;
  closeConfirmationDescription?: string;
  onCloseConfirmCallback?: (shouldClose: boolean) => void;
}

function DialogContent({
  className,
  children,
  closeIcon,
  showCloseButton = true,
  onCloseConfirm,
  alertType,
  alertConfig,
  disableCloseOnOutside = false,
  showCloseConfirmation = false,
  closeConfirmationType = "warning",
  closeConfirmationTitle,
  closeConfirmationDescription,
  onCloseConfirmCallback,
  ...props
}: DialogContentProps) {
  const [showCloseAlert, setShowCloseAlert] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = React.useState(false);

  // Ensure component is mounted before rendering portal content
  React.useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  const handleClose = async (event: React.MouseEvent) => {
    if (!mounted) return; // Prevent action if component is unmounting

    if (showCloseConfirmation) {
      event.preventDefault();
      setShowCloseAlert(true);
      return;
    }

    if (onCloseConfirm) {
      event.preventDefault();
      const shouldClose = await onCloseConfirm();
      if (!shouldClose) {
        return;
      }
    }
  };

  const handleCloseConfirm = () => {
    if (!mounted) return; // Prevent action if component is unmounting
    setShowCloseAlert(false);
    // Call the callback to let parent handle the closing
    onCloseConfirmCallback?.(true);
  };

  const handleCloseCancel = () => {
    if (!mounted) return; // Prevent action if component is unmounting
    setShowCloseAlert(false);
    // Call the callback to let parent know user cancelled
    // onCloseConfirmCallback?.(false);
  };

  // Custom close icon button style using Tailwind config colors
  const defaultCloseIcon = (
    <span className="flex items-center justify-center w-8 h-8 rounded-md border border-stroke-weak bg-neutral hover:bg-fill transition-colors cursor-pointer">
      <XIcon className="w-4 h-4 text-text" strokeWidth={2} />
    </span>
  );

  // Don't render portal content until mounted
  if (!mounted) {
    return null;
  }

  return (
    <>
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          onInteractOutside={
            disableCloseOnOutside
              ? (event) => event.preventDefault()
              : undefined
          }
          className={cn(
            "bg-background border border-stroke-weak shadow-lg text-text data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg p-6 duration-200 sm:max-w-lg",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && mounted && (
            <DialogPrimitive.Close
              ref={closeButtonRef}
              className="absolute top-4 right-4 p-0 bg-transparent border-none outline-none"
              onClick={handleClose}
              asChild
            >
              {closeIcon || defaultCloseIcon}
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>

      {/* Close Confirmation Alert Dialog */}
      {showCloseConfirmation && mounted && (
        <AlertDialog
          open={showCloseAlert}
          onOpenChange={setShowCloseAlert}
          type={closeConfirmationType}
          config={{
            title: closeConfirmationTitle || "Do you really want to exit?",
            message:
              closeConfirmationDescription ||
              "Exiting now will discard any unsaved changes.",
            confirmText: "Confirm",
            cancelText: "Cancel",
          }}
          onConfirm={handleCloseConfirm}
          onCancel={handleCloseCancel}
        />
      )}
    </>
  );
}

interface DialogHeaderProps extends React.ComponentProps<"div"> {}

function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "text-text border-b border-stroke-weak pb-4 mb-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl font-bold text-text leading-tight", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-base text-weak mt-1", className)}
      {...props}
    />
  );
}

// Alert Dialog Component
interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: AlertType;
  config?: Partial<AlertConfig>;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  loadingText?: string;
}

function AlertDialog({
  open,
  onOpenChange,
  type = "custom",
  config,
  onConfirm,
  onCancel,
  isLoading = false,
  loadingText = "Loading...",
}: AlertDialogProps) {
  // Use provided config or fallback to defaults
  const alertConfig = config
    ? { ...defaultAlertConfigs[type], ...config }
    : defaultAlertConfigs[type];

  // Custom title and description for destructive actions
  const title = config?.title || alertConfig.title;
  const description = config?.message || alertConfig.message;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm?.();
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel?.();
      // Do NOT call onOpenChange(false) here, so the parent can control closing
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent disableCloseOnOutside={isLoading}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{alertConfig.icon}</div>
          <div className="flex-1">
            <DialogHeader className="border-0">
              <DialogTitle className="text-lg font-semibold mb-2">
                {title}
              </DialogTitle>
              <DialogDescription className="text-weak text-sm">
                {description}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {alertConfig.cancelText}
              </Button>
              <Button
                className={`bg-brand text-white cursor-pointer hover:bg-${alertConfig.color}/80 disabled:opacity-50 disabled:cursor-not-allowed`}
                size="sm"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {loadingText}
                  </div>
                ) : (
                  alertConfig.confirmText
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  AlertDialog,
  // Alert types and functions
  type AlertType,
  type AlertConfig,
  defaultAlertConfigs,
  createAlertConfig,
};
