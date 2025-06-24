# Reusable Modal Components

This directory contains a comprehensive set of reusable modal components built on top of the shadcn/ui Dialog and AlertDialog components.

## Components

### MainModal

The base modal component with full customization options.

#### Props

- `isOpen: boolean` - Controls modal visibility
- `onOpenChange: (isOpen: boolean) => void` - Callback when modal state changes
- `children: React.ReactNode` - Modal content
- `title: string` - Modal title
- `description?: string` - Optional modal description
- `trigger?: React.ReactNode` - Optional trigger element
- `maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "responsive"` - Modal width (default: "2xl")
- `showCloseButton?: boolean` - Show/hide close button (default: true)
- `onClose?: () => void` - Custom close handler
- `className?: string` - Additional CSS classes

#### Basic Usage

```tsx
import MainModal from "@/app/_components/custom-modals/main-modal";

const [isOpen, setIsOpen] = useState(false);

<MainModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="My Modal"
  description="Optional description for the modal"
  trigger={<Button>Open Modal</Button>}
>
  <p>Modal content goes here</p>
</MainModal>;
```

#### Responsive Modal

Perfect for content that needs to adapt to different screen sizes.

```tsx
<MainModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Responsive Modal"
  maxWidth="responsive"
>
  <div className="space-y-4">
    <p>This modal adapts to different screen sizes:</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Mobile: 95% viewport width</li>
      <li>Small screens: 90% viewport width</li>
      <li>Medium screens: 800px max width</li>
      <li>Large screens: 1500px max width</li>
    </ul>
  </div>
</MainModal>
```

### AlertDialog

A reusable alert dialog component for confirmations and warnings.

#### Props

- `isOpen: boolean` - Controls dialog visibility
- `onOpenChange: (isOpen: boolean) => void` - Callback when dialog state changes
- `title: string` - Dialog title
- `description?: string` - Optional dialog description
- `trigger?: React.ReactNode` - Optional trigger element
- `onConfirm: () => void` - Action to perform on confirmation
- `onCancel?: () => void` - Optional action to perform on cancellation
- `confirmText?: string` - Text for confirm button (default: "Confirm")
- `cancelText?: string` - Text for cancel button (default: "Cancel")
- `variant?: "default" | "destructive" | "warning" | "success"` - Visual variant (default: "default")
- `size?: "sm" | "md" | "lg"` - Dialog size (default: "md")
- `showCancel?: boolean` - Show/hide cancel button (default: true)
- `className?: string` - Additional CSS classes

#### Basic Usage

```tsx
import AlertDialogComponent from "@/app/_components/custom-modals/alert-dialog";

const [isOpen, setIsOpen] = useState(false);

<AlertDialogComponent
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  trigger={<Button>Show Alert</Button>}
  onConfirm={() => console.log("Confirmed!")}
  confirmText="Proceed"
  cancelText="Cancel"
/>;
```

#### Pre-configured Alert Dialog Variants

##### DestructiveAlertDialog

For dangerous actions like deletions.

```tsx
import { DestructiveAlertDialog } from "@/app/_components/custom-modals/alert-dialog";

<DestructiveAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Item"
  description="Are you sure you want to delete this item?"
  onConfirm={handleDelete}
  confirmText="Delete"
  cancelText="Cancel"
/>;
```

##### WarningAlertDialog

For actions that may have unintended consequences.

```tsx
import { WarningAlertDialog } from "@/app/_components/custom-modals/alert-dialog";

<WarningAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Warning"
  description="This action may have unintended consequences."
  onConfirm={handleProceed}
  confirmText="Proceed Anyway"
  cancelText="Cancel"
/>;
```

##### SuccessAlertDialog

For successful actions that require confirmation.

```tsx
import { SuccessAlertDialog } from "@/app/_components/custom-modals/alert-dialog";

<SuccessAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Success"
  description="Your action was completed successfully."
  onConfirm={handleContinue}
  confirmText="Continue"
  cancelText="Close"
/>;
```

#### Common Alert Dialog Patterns

##### DeleteAlertDialog

Pre-configured for deletion confirmations.

```tsx
import { DeleteAlertDialog } from "@/app/_components/custom-modals/alert-dialog";

<DeleteAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  itemName="this product"
  onConfirm={handleDelete}
/>;
```

##### UnsavedChangesAlertDialog

For warning about unsaved changes.

```tsx
import { UnsavedChangesAlertDialog } from "@/app/_components/custom-modals/alert-dialog";

<UnsavedChangesAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  onConfirm={handleLeave}
  onCancel={handleStay}
/>;
```

### Pre-configured Modal Variants

#### SmallModal

Perfect for confirmations or simple forms.

```tsx
import { SmallModal } from "@/app/_components/custom-modals/main-modal";

<SmallModal isOpen={isOpen} onOpenChange={setIsOpen} title="Small Modal">
  <p>Simple content</p>
</SmallModal>;
```

#### LargeModal

Ideal for complex forms or detailed content.

```tsx
import { LargeModal } from "@/app/_components/custom-modals/main-modal";

<LargeModal isOpen={isOpen} onOpenChange={setIsOpen} title="Large Modal">
  <div className="space-y-4">{/* Complex form or content */}</div>
</LargeModal>;
```

#### FullWidthModal

For maximum content display.

```tsx
import { FullWidthModal } from "@/app/_components/custom-modals/main-modal";

<FullWidthModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Full Width Modal"
>
  <div className="grid grid-cols-3 gap-4">{/* Wide content layout */}</div>
</FullWidthModal>;
```

### ConfirmationModal

Specialized modal for confirmations with built-in action buttons.

#### Props

- `isOpen: boolean`
- `onOpenChange: (isOpen: boolean) => void`
- `title: string`
- `message: string`
- `onConfirm: () => void`
- `confirmText?: string` (default: "Confirm")
- `cancelText?: string` (default: "Cancel")
- `variant?: "default" | "destructive"` (default: "destructive")

#### Usage

```tsx
import { ConfirmationModal } from "@/app/_components/custom-modals/main-modal";

<ConfirmationModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  onConfirm={() => {
    // Handle deletion
    console.log("Item deleted");
  }}
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
/>;
```

### Utility Functions

#### createButtonModal

Creates a modal with a pre-configured button trigger.

```tsx
import { createButtonModal } from "@/app/_components/custom-modals/main-modal";

const CustomButtonModal = createButtonModal(
  "Open Modal", // Button text
  "outline", // Button variant
  "sm" // Button size
);

<CustomButtonModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Custom Button Modal"
>
  <p>Modal content</p>
</CustomButtonModal>;
```

#### createAlertDialog

Creates an alert dialog with a pre-configured button trigger.

```tsx
import { createAlertDialog } from "@/app/_components/custom-modals/alert-dialog";

const CustomAlertDialog = createAlertDialog(
  "Show Alert", // Button text
  "outline", // Button variant
  "sm" // Button size
);

<CustomAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Custom Alert"
  description="This is a custom alert dialog"
  onConfirm={handleConfirm}
/>;
```

## Usage Patterns

### 1. Form Modals

```tsx
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: "", email: "" });

<MainModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Contact Form"
  trigger={<Button>Open Form</Button>}
  maxWidth="lg"
>
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
    </div>
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">Submit</Button>
    </div>
  </form>
</MainModal>;
```

### 2. Delete Confirmations

```tsx
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<string | null>(null);

const handleDeleteClick = (id: string) => {
  setItemToDelete(id);
  setDeleteDialogOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!itemToDelete) return;
  // Perform deletion
  await deleteItem(itemToDelete);
  setItemToDelete(null);
};

<DeleteAlertDialog
  isOpen={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  itemName="this item"
  onConfirm={handleDeleteConfirm}
/>;
```

### 3. Programmatic Control

```tsx
const [isOpen, setIsOpen] = useState(false);

// Open modal programmatically
const handleSomeAction = () => {
  setIsOpen(true);
};

<MainModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Programmatic Modal"
  showCloseButton={true}
>
  <p>This modal was opened programmatically</p>
</MainModal>;
```

### 4. Custom Styling

```tsx
<MainModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Custom Styled Modal"
  className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200"
  maxWidth="xl"
>
  <div className="space-y-4">
    <p className="text-blue-800">Custom styled content</p>
  </div>
</MainModal>
```

## Migration from Inline Dialogs

If you have existing inline Dialog components, you can easily migrate them:

### Before

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>My Modal</DialogTitle>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>
```

### After

```tsx
<MainModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="My Modal"
  trigger={<Button>Open</Button>}
  maxWidth="2xl"
>
  <div>Content</div>
</MainModal>
```

## Best Practices

1. **Use appropriate size variants** - Choose the right modal size for your content
2. **Handle form submissions properly** - Always close the modal after successful form submission
3. **Provide clear titles** - Make modal titles descriptive and action-oriented
4. **Use ConfirmationModal for destructive actions** - Provides consistent UX for dangerous operations
5. **Use AlertDialog for confirmations** - Better UX than browser confirm() dialogs
6. **Consider accessibility** - The components are built with accessibility in mind, but ensure your content follows best practices

## Examples

See `usage-examples.tsx` and `alert-dialog-examples.tsx` for comprehensive examples of all modal and alert dialog variants and usage patterns.
