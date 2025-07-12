# User Management Features

This module provides comprehensive user management functionality for the Unique Tour and Rentals System.

## Features

### 1. User Invitation (UpsertUser)

- **File**: `form/UpsertUser.tsx`
- **API**: `api/inviteUserRole.tsx`
- **Purpose**: Invite new users to the system
- **Access**: Admin and Reservation Agents
- **Fields**: First Name, Last Name, Email, Role

### 2. User Update (Admin Only)

- **File**: `form/UpdateUser.tsx`
- **API**: `api/updateUser.ts` and `api/updateUserClient.ts`
- **Route**: `/api/users/[id]`
- **Purpose**: Update existing user names, roles, and phone numbers (email cannot be changed)
- **Access**: Admin only
- **Fields**: First Name, Last Name, Role, Phone Number (Email is read-only)

## API Endpoints

### PUT `/api/users/[id]`

Updates user information (admin only)

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "role": "reservation_agent",
  "phone_number": "+1234567890"
}
```

**Response:**

```json
{
  "success": true
}
```

**Error Response:**

```json
{
  "error": "Admin access required"
}
```

## Security

- All user update operations require admin role verification
- Email addresses cannot be modified through this API
- Role validation ensures only valid roles are accepted
- Input validation prevents malicious data

## Usage

### Server Action

```typescript
import { updateUserServerAction } from "@/app/_features/users/api/updateUser";

const result = await updateUserServerAction({
  user_id: "user-uuid",
  first_name: "John",
  last_name: "Doe",
  role: "reservation_agent",
  phone_number: "+1234567890",
});
```

### Client API

```typescript
import { updateUserClient } from "@/app/_features/users/api/updateUserClient";

const result = await updateUserClient({
  user_id: "user-uuid",
  first_name: "John",
  last_name: "Doe",
  role: "reservation_agent",
  phone_number: "+1234567890",
});
```

## Components

### UpdateUser Form

- Pre-populated with current user data
- Email field is disabled and read-only
- Real-time validation
- Success/error toast notifications
- Admin role verification

### UsersTable Integration

- Edit button in dropdown menu
- Modal dialog for user editing
- Automatic page refresh after successful update
