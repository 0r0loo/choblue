import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const inputVariants = cva(
  "flex w-full rounded-md px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        outline: "border border-input bg-background shadow-sm",
        filled: "border border-transparent bg-surface",
      },
      size: {
        sm: "h-8 text-xs",
        md: "h-9 text-sm",
        lg: "h-10 text-base",
      },
      status: {
        success: "border-success focus-visible:ring-success",
        warning: "border-warning focus-visible:ring-warning",
        error: "border-error focus-visible:ring-error",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  }
);

interface InputProps
  extends Omit<ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({
  className,
  variant,
  size,
  status,
  type = "text",
  ref,
  ...props
}: InputProps) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={status === "error" ? true : undefined}
      className={cn(inputVariants({ variant, size, status }), className)}
      {...props}
    />
  );
}

Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };