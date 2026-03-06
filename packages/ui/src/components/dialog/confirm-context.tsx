import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "./dialog-context";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "../button/button";

// Types
type ConfirmRenderProps = {
  confirm: () => void;
  cancel: () => void;
};

type SimpleConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  render?: never;
};

type CustomConfirmOptions = {
  render: (props: ConfirmRenderProps) => ReactNode;
  title?: never;
  description?: never;
  confirmText?: never;
  cancelText?: never;
  variant?: never;
};

type ConfirmOptions = SimpleConfirmOptions | CustomConfirmOptions;

// Context
type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return confirm;
}

useConfirm.displayName = "useConfirm";

// Internal state
type ConfirmState = {
  options: ConfirmOptions | null;
};

// ConfirmDialog (internal)
type ConfirmDialogProps = {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({ options, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        {options.render ? (
          options.render({ confirm: onConfirm, cancel: onCancel })
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{options.title}</DialogTitle>
              {options.description && (
                <DialogDescription>{options.description}</DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onCancel}>
                  {options.cancelText ?? "취소"}
                </Button>
              </DialogClose>
              <Button
                variant={options.variant === "danger" ? "danger" : "primary"}
                onClick={onConfirm}
              >
                {options.confirmText ?? "확인"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

ConfirmDialog.displayName = "ConfirmDialog";

// ConfirmProvider
type ConfirmProviderProps = {
  children: ReactNode;
};

function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [state, setState] = useState<ConfirmState>({ options: null });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current?.(false);
      resolveRef.current = resolve;
      setState({ options });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState({ options: null });
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState({ options: null });
  }, []);

  useEffect(() => {
    return () => {
      resolveRef.current?.(false);
      resolveRef.current = null;
    };
  }, []);

  return (
    <ConfirmContext value={confirm}>
      {children}
      {state.options && (
        <ConfirmDialog
          options={state.options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext>
  );
}

ConfirmProvider.displayName = "ConfirmProvider";

export { ConfirmProvider, useConfirm };
export type { ConfirmOptions, ConfirmRenderProps, SimpleConfirmOptions, CustomConfirmOptions };