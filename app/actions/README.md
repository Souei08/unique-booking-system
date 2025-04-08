# Actions Directory Structure

This directory contains all server-side actions and services for the Unique Tour and Rentals System. The structure is organized to be maintainable and easy to understand.

## Directory Structure

```
actions/
├── base.ts                # Base service class with common CRUD operations
├── types.ts              # Common types used across actions
├── schedule/             # Schedule-related actions and services
│   ├── actions.ts       # Server actions for schedules
│   └── service.ts       # Schedule service implementation
├── booking/             # Booking-related actions and services
│   ├── actions.ts       # Server actions for bookings
│   └── service.ts       # Booking service implementation
├── rentals/             # Rental-related actions and services
│   ├── actions.ts       # Server actions for rentals
│   └── service.ts       # Rental service implementation
└── auth/                # Authentication-related actions and services
    ├── actions.ts       # Server actions for authentication
    └── service.ts       # Authentication service implementation
```

## Structure Overview

1. **Base Service (`base.ts`)**

   - Contains the `BaseService` class
   - Provides common CRUD operations
   - Can be extended by specific services

2. **Types (`types.ts`)**

   - Contains shared TypeScript interfaces and types
   - Used across all actions and services

3. **Domain Directories**
   Each domain (e.g., schedule, booking) has:
   - `actions.ts`: Server actions that can be called from the client
   - `service.ts`: Service implementation with business logic

## Usage Example

```typescript
// Using server actions
import { saveRecurringSchedules } from "@/app/actions/schedule/actions";

// In a client component
async function handleSave() {
  const result = await saveRecurringSchedules(tourId, schedules);
  if (result.success) {
    // Handle success
  }
}
```

## Benefits of This Structure

1. **Separation of Concerns**

   - Actions handle server-side operations
   - Services contain business logic
   - Base service provides common functionality

2. **Type Safety**

   - Shared types ensure consistency
   - TypeScript interfaces for all operations

3. **Maintainability**

   - Clear folder structure
   - Each domain has its own directory
   - Common code is shared through base classes

4. **Scalability**
   - Easy to add new domains
   - Consistent pattern for all features

## Adding New Features

1. Create a new directory for your domain:

   ```
   actions/
   └── new-feature/
       ├── actions.ts
       └── service.ts
   ```

2. Create a service that extends BaseService:

   ```typescript
   import { BaseService } from "../base";

   export class NewFeatureService extends BaseService<NewFeature> {
     constructor() {
       super("table_name");
     }

     // Add custom methods
   }
   ```

3. Create server actions that use the service:

   ```typescript
   import { NewFeatureService } from "./service";

   const service = new NewFeatureService();

   export async function newFeatureAction() {
     return await service.someMethod();
   }
   ```

## Best Practices

1. Always use TypeScript interfaces for data structures
2. Keep actions thin - business logic belongs in services
3. Use the base service for common operations
4. Document your code with JSDoc comments
5. Handle errors consistently using SuccessResponse type
6. Use "use server" directive in all action files
