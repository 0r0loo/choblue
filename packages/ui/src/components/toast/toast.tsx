import { useContext, type ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { X } from "../icons";
import { ToastStateContext } from "./toast-context";

// Re-export everything from toast-context for backward compatibility
export {
  ToastProvider,
  useToast,
} from "./toast-context";
export type {
  ToastData,
  ToastContextValue,
  ToastProviderProps,
} from "./toast-context";

// -- Toast --

interface ToastProps extends ComponentProps<"div"> {
  variant?: "default" | "danger";
}

function Toast({ variant = "default", className, ref, ...props }: ToastProps) {
  return (
    <div
      ref={ref}
      data-variant={variant}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 shadow-lg",
        variant === "default" && "bg-background border-black/5 dark:border-white/10",
        variant === "danger" &&
          "bg-danger text-danger-foreground border-danger",
        className,
      )}
      {...props}
    />
  );
}
Toast.displayName = "Toast";

// -- ToastTitle --

type ToastTitleProps = ComponentProps<"div">;

function ToastTitle({ className, ref, ...props }: ToastTitleProps) {
  return (
    <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  );
}
ToastTitle.displayName = "ToastTitle";

// -- ToastDescription --

type ToastDescriptionProps = ComponentProps<"div">;

function ToastDescription({ className, ref, ...props }: ToastDescriptionProps) {
  return (
    <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
  );
}
ToastDescription.displayName = "ToastDescription";

// -- ToastClose --

type ToastCloseProps = ComponentProps<"button">;

function ToastClose({ className, ref, ...props }: ToastCloseProps) {
  return (
    <button
      type="button"
      ref={ref}
      aria-label="닫기"
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70",
        "hover:opacity-100 transition-opacity",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      <X size={16} />
    </button>
  );
}
ToastClose.displayName = "ToastClose";

// -- ToastItem (internal: renders individual toast from context) --

interface ToastItemProps {
  data: { id: string; title?: string; description?: string; variant?: "default" | "danger" };
  onDismiss: (id: string) => void;
}

function ToastItem({ data, onDismiss }: ToastItemProps) {
  const variant = data.variant ?? "default";

  return (
    <Toast variant={variant} className="relative">
      <div className="flex-1">
        {data.title && <ToastTitle>{data.title}</ToastTitle>}
        {data.description && (
          <ToastDescription>{data.description}</ToastDescription>
        )}
      </div>
      <ToastClose onClick={() => onDismiss(data.id)} />
    </Toast>
  );
}

// -- ToastViewport --

type ToastViewportProps = ComponentProps<"div">;

function ToastViewport({ className, ref, ...props }: ToastViewportProps) {
  const state = useContext(ToastStateContext);
  if (!state) throw new Error("ToastViewport must be used within <ToastProvider>");
  const { toasts, dismiss } = state;

  return (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 right-0 z-[300] flex flex-col gap-2 p-4 w-[380px]",
        className,
      )}
      {...props}
    >
      {toasts.map((toastData) => (
        <ToastItem key={toastData.id} data={toastData} onDismiss={dismiss} />
      ))}
    </div>
  );
}
ToastViewport.displayName = "ToastViewport";

// -- Exports --

export {
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
};
export type {
  ToastViewportProps,
  ToastProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastCloseProps,
};
