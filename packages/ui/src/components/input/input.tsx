import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const inputVariants = cva(
  [
    'flex w-full',                                                     // 레이아웃
    'rounded-md px-3',                                                 // 크기/간격
    'text-sm',                                                         // 모양/타이포
    'border border-input bg-background shadow-sm',                     // 배경/보더
    'transition-[color,background-color,border-color,box-shadow] duration-200 ease-apple', // 전환
    'file:border-0 file:bg-transparent file:text-sm file:font-medium', // 파일 입력
    'placeholder:text-muted-foreground',                               // 플레이스홀더
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:border-primary/50', // 부드러운 글로우 포커스
    'disabled:pointer-events-none disabled:opacity-50',                // 상태
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:text-destructive', // 유효성
  ],
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
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
}

Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
