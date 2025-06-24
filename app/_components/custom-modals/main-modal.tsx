import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MainModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "responsive";
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

const MainModal: React.FC<MainModalProps> = ({
  isOpen,
  onOpenChange,
  children,
  title,
  description,
  trigger,
  maxWidth = "2xl",
  showCloseButton = true,
  onClose,
  className = "",
}) => {
  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    responsive:
      "max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[1500px] max-h-[95vh] overflow-y-auto p-4 sm:p-6",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={`${maxWidthClasses[maxWidth]} ${className} p-0`}
      >
        <DialogHeader className={`border-b border-stroke-strong pb-4 p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-strong">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-weak">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-4 h-8 w-8 rounded-md bg-brand hover:bg-brand/80 text-white flex-shrink-0"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="pt-0 p-6 ">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

// Utility function to create a modal with a button trigger
export const createButtonModal = (
  buttonText: string,
  buttonVariant:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive" = "outline",
  buttonSize: "default" | "sm" | "lg" | "icon" = "sm"
) => {
  return ({ children, ...props }: Omit<MainModalProps, "trigger">) => (
    <MainModal
      {...props}
      trigger={
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonText}
        </Button>
      }
    >
      {children}
    </MainModal>
  );
};

// Pre-configured modal variants
export const SmallModal = (props: Omit<MainModalProps, "maxWidth">) => (
  <MainModal {...props} maxWidth="sm" />
);

export const LargeModal = (props: Omit<MainModalProps, "maxWidth">) => (
  <MainModal {...props} maxWidth="4xl" />
);

export const FullWidthModal = (props: Omit<MainModalProps, "maxWidth">) => (
  <MainModal {...props} maxWidth="7xl" />
);

export const ConfirmationModal = ({
  isOpen,
  onOpenChange,
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}) => (
  <MainModal
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    title={title}
    maxWidth="sm"
  >
    <div className="space-y-4">
      <p className="text-gray-600">{message}</p>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  </MainModal>
);

export const ImagePreviewModal = ({
  isOpen,
  onOpenChange,
  imageSrc,
  imageAlt = "Preview image",
  onClose,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageSrc: string;
  imageAlt?: string;
  onClose?: () => void;
}) => {
  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="
      max-w-3xl h-[50%] overflow-hidden
      flex flex-col bg-black bg-center bg-no-repeat bg-cover
    "
        style={{
          backgroundImage: `url(${imageSrc})`,
        }}
      >
        <DialogTitle className="sr-only">Image Preview</DialogTitle>

        {/* Close button */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="ml-4 h-8 w-8 rounded-md bg-brand hover:bg-brand/80 text-white flex-shrink-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainModal;
