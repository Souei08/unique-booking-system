# Tour Time and Date Components

This directory contains two versions of the tour time and date selection component:

## TourTimeAndDate.tsx (Regular Version)

- Used for customer bookings
- Respects slot limitations and availability
- Checks for fully booked dates and times
- Enforces maximum group size limits
- Shows remaining slots for each time slot
- Disables booking when no slots are available

## AdminTourTimeAndDate.tsx (Admin Version)

- Used for admin quick booking functionality
- **Unlimited slots** - No slot limitations enforced
- **No date restrictions** - Can book on any available date (except past dates)
- **No group size limits** - Can book unlimited number of people
- Shows "Unlimited slots" badge instead of remaining slot count
- Used in QuickBooking component for admin interfaces

## Key Differences

| Feature           | Regular Version           | Admin Version                       |
| ----------------- | ------------------------- | ----------------------------------- |
| Slot Limits       | Enforced                  | Unlimited (999 slots)               |
| Date Restrictions | Checks fully booked dates | No restrictions (except past dates) |
| Group Size        | Limited by tour settings  | Unlimited                           |
| Slot Display      | Shows remaining slots     | Shows "Unlimited slots"             |
| Usage             | Customer booking flow     | Admin quick booking                 |

## Usage

### Regular Version

Used in the main customer booking flow where slot availability and limitations matter.

### Admin Version

Used in:

- QuickBooking component (admin dashboard)
- Calendar booking page (admin interface)
- Any admin-initiated booking process

## Implementation Notes

The admin version removes the following API calls and checks:

- `getRemainingSlots()` - Not called, always returns 999
- `getFullyBookedDatesFromList()` - Not called, no date restrictions
- Slot availability validation - Bypassed
- Group size validation - Bypassed

This allows admins to override normal booking restrictions for special cases, customer service, or administrative purposes.
