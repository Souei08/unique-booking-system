import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A safe version of useState that prevents state updates after component unmounting
 * This helps prevent "Cannot perform a React state update on an unmounted component" warnings
 * and potential DOM manipulation errors.
 */
export function useSafeState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState(initialState);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((value: T | ((prevState: T) => T)) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState] as const;
}

/**
 * A hook that provides a mounted ref to check if component is still mounted
 * Useful for preventing actions on unmounted components
 */
export function useMountedRef() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}

/**
 * A hook that safely executes a callback only if the component is still mounted
 */
export function useSafeCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const mountedRef = useMountedRef();

  return useCallback(
    (...args: Parameters<T>) => {
      if (mountedRef.current) {
        return callback(...args);
      }
    },
    [callback, mountedRef]
  ) as T;
}
