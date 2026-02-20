import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const inputVariants = cva(
  "flex w-full rounded-md px-3 text-sm transition-colors border border-input bg-background shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:text-destructive",
  {
    variants: {
      size: {
        sm: "h-8 text-xs",
        md: "h-9 text-sm",
        lg: "h-10 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface InputProps
  extends Omit<ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({
  className,
  size,
  type = "text",
  ref,
  ...props
}: InputProps) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  );
}

Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
