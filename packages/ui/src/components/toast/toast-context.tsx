import {
  createContext,
  useState,
  useCallback,
  useContext,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

// -- Types --

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  toast: (data: Omit<ToastData, "id">) => { id: string };
  dismiss: (id: string) => void;
}

// -- Context --

// Dispatch context: stable reference, never changes
const ToastDispatchContext = createContext<{
  toast: (data: Omit<ToastData, "id">) => { id: string };
  dismiss: (id: string) => void;
  getToasts: () => ToastData[];
} | null>(null);

// State context: changes when toasts change (for viewport rendering)
const ToastStateContext = createContext<{
  toasts: ToastData[];
  dismiss: (id: string) => void;
} | null>(null);

function useToast(): ToastContextValue {
  const dispatch = useContext(ToastDispatchContext);
  if (!dispatch) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return {
    get toasts() {
      return dispatch.getToasts();
    },
    toast: dispatch.toast,
    dismiss: dispatch.dismiss,
  };
}

// -- ToastProvider --

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = 5000;
function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastsRef = useRef<ToastData[]>([]);
  toastsRef.current = toasts;

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToasts = useCallback(() => toastsRef.current, []);

  const toast = useCallback(
    (data: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { ...data, id }]);
      return { id };
    },
    [],
  );

  // Stable dispatch value: never changes reference
  const dispatchValue = useMemo(
    () => ({ toast, dismiss, getToasts }),
    [toast, dismiss, getToasts],
  );

  // State value: changes when toasts change
  const stateValue = useMemo(
    () => ({ toasts, dismiss }),
    [toasts, dismiss],
  );

  // Set up auto-dismiss timers for new toasts
  useEffect(() => {
    for (const t of toasts) {
      if (!timersRef.current.has(t.id)) {
        const duration = t.duration ?? DEFAULT_DURATION;
        const timer = setTimeout(() => {
          timersRef.current.delete(t.id);
          setToasts((prev) => prev.filter((item) => item.id !== t.id));
        }, duration);
        timersRef.current.set(t.id, timer);
      }
    }
  }, [toasts]);

  // Cleanup on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastDispatchContext.Provider value={dispatchValue}>
      <ToastStateContext.Provider value={stateValue}>
        {children}
      </ToastStateContext.Provider>
    </ToastDispatchContext.Provider>
  );
}
ToastProvider.displayName = "ToastProvider";

// -- Exports --

export { ToastDispatchContext, ToastStateContext, ToastProvider, useToast };
export type { ToastData, ToastContextValue, ToastProviderProps };
