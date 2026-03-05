import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { Slot } from "../../lib/slot";

// Context
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx)
    throw new Error(
      "Dialog compound components must be used within <Dialog>",
    );
  return ctx;
}

// Dialog (root - Provider)
interface DialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext>
  );
}

Dialog.displayName = "Dialog";

// DialogTrigger
interface DialogTriggerProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

function DialogTrigger({ children, ref, asChild, ...props }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();
  const triggerProps = { ...props, ref, onClick: () => onOpenChange(true) };

  if (asChild) {
    return <Slot {...triggerProps}>{children}</Slot>;
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  );
}

DialogTrigger.displayName = "DialogTrigger";

// DialogContent - uses native <dialog> element
type DialogContentProps = ComponentProps<"dialog">;

function DialogContent({
  className,
  children,
  ref,
  ...props
}: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  const internalRef = useRef<HTMLDialogElement | null>(null);

  const setRef = useCallback(
    (node: HTMLDialogElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    const node = internalRef.current;
    if (!node) return;

    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <dialog
      ref={setRef}
      className={cn(
        "fixed inset-0 m-auto w-full max-w-lg rounded-xl border border-black/5 dark:border-white/10 bg-background p-0 shadow-xl backdrop:bg-black/60",
        className,
      )}
      onClose={handleClose}
      {...props}
    >
      {children}
    </dialog>
  );
}

DialogContent.displayName = "DialogContent";

// DialogClose
interface DialogCloseProps extends ComponentProps<"button"> {
  asChild?: boolean;
}

function DialogClose({ children, ref, asChild, ...props }: DialogCloseProps) {
  const { onOpenChange } = useDialogContext();
  const closeProps = { ...props, ref, onClick: () => onOpenChange(false) };

  if (asChild) {
    return <Slot {...closeProps}>{children}</Slot>;
  }

  return (
    <button type="button" {...closeProps}>
      {children}
    </button>
  );
}

DialogClose.displayName = "DialogClose";

export {
  DialogContext,
  useDialogContext,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
};
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogCloseProps,
};
