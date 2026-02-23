import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Re-export everything from dialog-context for backward compatibility
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  useDialogContext,
} from "./dialog-context";
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogCloseProps,
} from "./dialog-context";

// DialogHeader
type DialogHeaderProps = ComponentProps<"div">;

function DialogHeader({ className, ref, ...props }: DialogHeaderProps) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

DialogHeader.displayName = "DialogHeader";

// DialogTitle
type DialogTitleProps = ComponentProps<"h2">;

function DialogTitle({ className, ref, ...props }: DialogTitleProps) {
  return (
    <h2
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

DialogTitle.displayName = "DialogTitle";

// DialogDescription
type DialogDescriptionProps = ComponentProps<"p">;

function DialogDescription({
  className,
  ref,
  ...props
}: DialogDescriptionProps) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

DialogDescription.displayName = "DialogDescription";

// DialogFooter
type DialogFooterProps = ComponentProps<"div">;

function DialogFooter({ className, ref, ...props }: DialogFooterProps) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-end gap-2 p-6 pt-0", className)}
      {...props}
    />
  );
}

DialogFooter.displayName = "DialogFooter";

export {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
export type {
  DialogHeaderProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogFooterProps,
};
