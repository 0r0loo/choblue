import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const textareaVariants = cva(
  [
    'flex w-full',                                                     // 레이아웃
    'rounded-md px-3 py-2',                                            // 크기/간격
    'text-sm',                                                         // 모양/타이포
    'border border-input bg-background shadow-sm',                     // 배경/보더
    'transition-[color,background-color,border-color,box-shadow] duration-200 ease-apple', // 전환
    'placeholder:text-muted-foreground',                               // 플레이스홀더
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:border-primary/50', // 부드러운 글로우 포커스
    'disabled:pointer-events-none disabled:opacity-50',                // 상태
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:text-destructive', // 유효성
  ],
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface TextareaProps
  extends Omit<ComponentProps<"textarea">, "size">,
    VariantProps<typeof textareaVariants> {}

function Textarea({
  className,
  size,
  ref,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ size }), className)}
      {...props}
    />
  );
}

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
export type { TextareaProps };
