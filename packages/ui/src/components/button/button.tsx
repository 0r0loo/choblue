import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap', // 레이아웃
    'rounded-md text-sm font-medium',                                  // 모양/타이포
    'transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-apple active:scale-[0.98]', // 애니메이션
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', // 포커스
    'disabled:pointer-events-none disabled:opacity-50',                // 상태
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-sm shadow-[inset_0_1px_rgba(255,255,255,0.2)] hover:bg-primary/90 hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        danger:
          "bg-danger text-danger-foreground shadow-sm shadow-[inset_0_1px_rgba(255,255,255,0.15)] hover:bg-danger/90 hover:shadow-md",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
