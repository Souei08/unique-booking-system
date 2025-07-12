# ContentLayout Component Refactoring

## Overview

The `ContentLayout` component has been refactored to improve maintainability, reduce code duplication, and make it easier to add new modal types.

## Key Improvements

### 1. **Configuration-Driven Approach**

- Modal configurations are now stored in a separate `modalConfigs.ts` file
- Each modal type has its own configuration object with component, props, and styling options
- Easy to add new modal types without modifying the main component

### 2. **Reusable Modal Wrapper**

- Created a `ModalWrapper` component that handles all modal rendering logic
- Supports both regular `Dialog` and custom `MainModal` components
- Automatically handles success/cancel callbacks

### 3. **Custom Hook for State Management**

- `useModal` hook provides clean state management for modal open/close
- Reusable across different components
- Provides `openModal`, `closeModal`, and `toggleModal` functions

### 4. **Reduced Code Duplication**

- Eliminated repetitive dialog state management
- Single modal state instead of multiple boolean states
- Unified modal rendering logic

## File Structure

```
dashboard/
├── ContentLayout.tsx      # Main layout component
├── modalConfigs.ts        # Modal configurations
├── useModal.ts           # Custom hook for modal state
└── README.md             # This documentation
```

## Adding New Modal Types

To add a new modal type:

1. **Update the type definition** in `ContentLayout.tsx`:

```typescript
modalRoute?: "booking" | "tours" | "users" | "products" | "promos" | "newType";
```

2. **Add configuration** in `modalConfigs.ts`:

```typescript
newType: {
  component: NewComponent,
  props: {
    // default props
  },
  dialogClassName: "max-w-lg",
  disableCloseOnOutside: false,
  showCloseConfirmation: false,
},
```

3. **Import the component** in `modalConfigs.ts`:

```typescript
import NewComponent from "@/app/_features/new-feature/components/NewComponent";
```

## Usage Example

```typescript
<ContentLayout
  title="Users"
  description="Manage system users"
  buttonText="Add User"
  modalTitle="Create New User"
  modalDescription="Add a new user to the system"
  modalRoute="users"
>
  {/* Your content here */}
</ContentLayout>
```

## Benefits

- **Maintainability**: Easy to modify modal behavior without touching the main component
- **Scalability**: Simple to add new modal types
- **Reusability**: Modal logic can be reused in other components
- **Type Safety**: Strong typing for modal configurations
- **Clean Code**: Reduced complexity and improved readability

## Migration Notes

The refactoring maintains backward compatibility. Existing usage of `ContentLayout` will continue to work without changes.
