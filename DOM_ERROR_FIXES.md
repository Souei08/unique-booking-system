# DOM removeChild Error Fixes

## Problem

`NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`

This error occurs when React tries to remove a DOM node that either:

1. Has already been removed
2. Never existed as a child of the specified parent
3. Is being removed during component unmounting
4. Has been modified by direct DOM manipulation

## Root Causes Identified

### 1. **Portal Management Issues**

- Multiple Radix UI portals mounting/unmounting rapidly
- Portal content removed while still being referenced
- SSR/hydration mismatches with portals

### 2. **Dynamic Array Operations**

- Array splice/filter operations on slot details
- Product arrays being modified during renders
- Missing or non-unique keys in dynamic lists

### 3. **State Update Race Conditions**

- State updates after component unmounting
- Rapid state changes during navigation
- Async operations completing after unmount

### 4. **useEffect Cleanup Issues**

- Missing cleanup functions for intervals/timers
- Event listeners not being removed properly
- DOM manipulation during component unmounting

## Solutions Implemented

### 1. **Enhanced Portal Components**

**File: `components/ui/dialog.tsx`**

```typescript
// Added mounted state tracking
const [mounted, setMounted] = React.useState(false);

// Prevent actions on unmounted components
const handleClose = async (event: React.MouseEvent) => {
  if (!mounted) return; // Prevent action if unmounting
  // ... rest of handler
};

// Don't render portal content until mounted
if (!mounted) {
  return null;
}
```

### 2. **Safe Array Operations**

**File: `app/_features/booking/components/CreateBookingv2/booking-steps/SlotDetailsV2.tsx`**

```typescript
// Added unique IDs for stable keys
const arr = [...prev];
while (arr.length < numberOfPeople) {
  arr.push({
    id: `slot-${Date.now()}-${slotIdCounter}`, // Unique ID
    type: "default",
    price: tourRate,
  });
}

// Safe removal with bounds checking
const handleRemoveSlot = (index: number) => {
  if (idx >= 0 && idx < slotDetails.length) {
    handleRemoveSlot?.(idx);
  }
};

// Stable key generation
const slotKey = slot.id || `slot-fallback-${idx}`;
```

### 3. **Safe State Management**

**File: `app/_lib/utils/useSafeState.ts`**

```typescript
export function useSafeState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState(initialState);
  const mountedRef = useRef(true);

  const setSafeState = useCallback((value: T | ((prevState: T) => T)) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState] as const;
}
```

### 4. **Proper useEffect Cleanup**

**File: `app/_components/common/ImageCarousel.tsx`**

```typescript
// Cleanup intervals and event listeners
useEffect(() => {
  // Setup
  window.addEventListener("resize", checkScreenSize);

  return () => {
    // Cleanup
    window.removeEventListener("resize", checkScreenSize);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, []);
```

## Prevention Guidelines

### 1. **Always Use Stable Keys**

```typescript
// ❌ Bad - using index as key
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ Good - using stable unique ID
{items.map((item) => (
  <div key={item.id || `item-${item.name}-${index}`}>{item.name}</div>
))}
```

### 2. **Implement Proper Cleanup**

```typescript
useEffect(() => {
  const handleResize = () => {
    /* ... */
  };
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

### 3. **Use Safe State Updates**

```typescript
// ❌ Dangerous - can update after unmount
const [data, setData] = useState([]);

// ✅ Safe - prevents updates after unmount
const [data, setData] = useSafeState([]);
```

### 4. **Validate Array Operations**

```typescript
// ❌ Dangerous
const removeItem = (index) => {
  items.splice(index, 1);
};

// ✅ Safe
const removeItem = (index) => {
  if (index >= 0 && index < items.length && mountedRef.current) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }
};
```

### 5. **Handle Async Operations Safely**

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.getData();

      // ✅ Check if still mounted before updating state
      if (mountedRef.current) {
        setData(response);
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(error);
      }
    }
  };

  fetchData();
}, []);
```

## Usage Examples

### Using Safe State Hook

```typescript
import { useSafeState, useMountedRef } from "@/app/_lib/utils/useSafeState";

function MyComponent() {
  const [items, setItems] = useSafeState([]);
  const mountedRef = useMountedRef();

  const handleRemove = (index) => {
    if (!mountedRef.current) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };
}
```

### Safe Portal Implementation

```typescript
function MyModal({ isOpen }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return (
    <Portal>
      {/* Modal content */}
    </Portal>
  );
}
```

## Testing

To verify fixes are working:

1. **Navigate rapidly between pages** with modals
2. **Add/remove items quickly** in dynamic lists
3. **Open/close multiple modals** in succession
4. **Check browser console** for DOM errors

## Files Modified

- `components/ui/dialog.tsx` - Enhanced portal management
- `app/_features/booking/components/CreateBookingv2/booking-steps/SlotDetailsV2.tsx` - Safe array operations
- `app/_components/common/ImageCarousel.tsx` - Proper cleanup
- `app/_lib/utils/useSafeState.ts` - New safe state utilities
- `app/_features/booking/components/CreateBookingv2/booking-steps/CheckForm.tsx` - Safe state usage

The implementations above should significantly reduce or eliminate the `removeChild` DOM errors in your application.
