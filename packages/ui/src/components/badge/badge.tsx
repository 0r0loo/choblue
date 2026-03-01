import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  [
    'inline-flex items-center',                                        // 레이아웃
    'rounded-md px-2.5 py-0.5',                                       // 크기/간격
    'border',                                                          // 배경/보더
    'text-xs font-medium',                                              // 모양/타이포
    'transition-colors',                                               // 효과
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', // 포커스
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',       // 포커스 오프셋
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border-transparent shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent",
        success:
          "bg-success text-white border-transparent shadow-sm",
        info:
          "bg-info text-white border-transparent shadow-sm",
        warning:
          "bg-warning text-white border-transparent shadow-sm",
        danger:
          "bg-danger text-white border-transparent shadow-sm",
        outline: "text-foreground border-input",
        destructive:
          "bg-destructive text-destructive-foreground border-transparent shadow-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

interface BadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ref, ...props }: BadgeProps) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

Badge.displayName = "Badge";

export { Badge, badgeVariants };
export type { BadgeProps };
