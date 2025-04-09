# Forms Structure

This directory contains all the form components used throughout the application. The forms are organized in a modular and reusable way to maintain consistency and reduce duplication.

## Directory Structure

```
forms/
├── common/           # Shared form components
│   └── BaseForm.tsx  # Base form component with common functionality
├── schemas/          # Validation schemas
│   └── index.ts      # Centralized validation schemas
├── auth/             # Authentication forms
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── booking/          # Booking forms
│   └── UpsertBookingForm.tsx
├── tours/            # Tour forms
│   └── UpsertTourForm.tsx
├── schedule/         # Schedule forms
│   └── ScheduleForm.tsx
└── rentals/          # Rental forms
    └── ...
```

## Component Structure

Each form feature follows a consistent pattern:

1. **Base Components**: Common form elements and functionality in `common/`
2. **Validation Schemas**: Centralized in `schemas/index.ts`
3. **Feature-specific Forms**: Organized by feature in their respective directories

## Usage

### Creating a New Form

1. Define your validation schema in `schemas/index.ts`
2. Create a new form component using the `BaseForm` component:

```tsx
import { BaseForm } from "../common/BaseForm";
import { yourSchema, YourFormValues } from "../schemas";

export default function YourForm() {
  const handleSubmit = async (data: YourFormValues) => {
    // Handle form submission
  };

  const fields = [
    {
      name: "fieldName" as const,
      type: "text",
      placeholder: "Enter value",
      label: "Field Label",
      colSpan: "full" as const,
    },
    // More fields...
  ];

  return (
    <BaseForm<YourFormValues>
      schema={yourSchema}
      onSubmit={handleSubmit}
      fields={fields}
      buttonText="Submit"
    />
  );
}
```

### Field Types

The `BaseForm` component supports the following field types:

- `text`: Text input
- `number`: Number input
- `email`: Email input
- `password`: Password input
- `textarea`: Multi-line text input
- `select`: Dropdown select
- `array`: Array input (rendered as textarea)
- `hidden`: Hidden input

### Column Spanning

Fields can span either half or full width using the `colSpan` property:

- `"half"`: Takes up half the width (default)
- `"full"`: Takes up the full width

## Best Practices

1. Always use the centralized schemas for validation
2. Reuse the `BaseForm` component for consistent styling and behavior
3. Keep form-specific logic in the form component
4. Use TypeScript for type safety
5. Handle errors appropriately
