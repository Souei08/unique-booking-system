# Booking Status Update Feature

This feature allows administrators to manually update booking and payment statuses when there are issues that require manual intervention.

## Components

### StatusUpdateModal
A modal component that provides a user-friendly interface for updating booking and payment statuses.

**Features:**
- Update booking status (pending, confirmed, cancelled, completed, no_show, rescheduled)
- Update payment status (pending, paid, failed, cancelled, refunding, refunded, partial_refund)
- Add admin notes for status changes
- Visual indicators for manual payment status updates
- Toast notifications for success/error feedback

### Manual Payment Status Update
The system includes a dedicated API function for manually updating payment statuses when automatic updates fail.

**Use Cases:**
- Payment processed but status not updated automatically
- Stripe webhook failures
- Manual payment verification needed
- Payment disputes or chargebacks

## API Functions

### updateManualPaymentStatus
Updates both payment and booking statuses in a single transaction.

**Parameters:**
- `bookingId`: The booking ID to update
- `paymentStatus`: The new payment status
- `reason`: Optional reason for the update
- `adminNotes`: Optional admin notes stored with the payment record

**Behavior:**
- Updates the payment status in the `payments` table
- Automatically updates the booking status based on payment status:
  - `paid` → `confirmed`
  - `failed` or `cancelled` → `cancelled`
  - Other statuses → `pending`

## UI Integration

### BookingTableV2
The main booking table now includes:

1. **Payment Status Column**: Shows payment status with visual indicators
2. **Status Mismatch Detection**: Red dot indicator for bookings with status mismatches
3. **Update Status Action**: New dropdown menu item for status updates
4. **Needs Attention Filter**: Quick filter button to show bookings that may need attention

### Status Mismatch Detection
The system automatically detects and highlights bookings with potential issues:
- Payment status "paid" but booking status not "confirmed"
- Payment status "failed" but booking status not "cancelled"
- Payment status "pending" but booking status "confirmed"

## Usage

1. **Access Status Update**: Click the "Update Status" option in the booking actions dropdown
2. **Review Current Status**: The modal shows current booking and payment statuses
3. **Select New Status**: Choose the appropriate status from the dropdown menus
4. **Add Notes**: Optionally add admin notes explaining the status change
5. **Confirm Update**: Click "Update Status" to apply the changes

## Security Considerations

- Manual payment status updates are logged with admin notes
- The system provides clear warnings about manual overrides
- All changes are tracked with timestamps and user information
- Status updates trigger automatic booking status adjustments

## Error Handling

- Toast notifications for success and error feedback
- Validation of status combinations
- Graceful error handling with user-friendly messages
- Automatic refresh of booking data after successful updates 