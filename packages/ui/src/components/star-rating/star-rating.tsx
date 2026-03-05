import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const starRatingVariants = cva("inline-flex gap-0.5", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-xl",
      lg: "text-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type StarRatingVariantProps = VariantProps<typeof starRatingVariants>;

interface StarRatingBaseProps {
  value: number;
  max?: number;
}

interface StarRatingReadOnlyProps extends StarRatingBaseProps {
  readOnly: true;
  onChange?: never;
}

interface StarRatingInteractiveProps extends StarRatingBaseProps {
  readOnly?: false;
  onChange: (value: number) => void;
}

export type StarRatingProps = (StarRatingReadOnlyProps | StarRatingInteractiveProps) &
  StarRatingVariantProps &
  Omit<ComponentProps<"div">, "onChange">;

export function StarRating({
  value,
  max = 5,
  readOnly = false,
  onChange,
  size,
  className,
  ...props
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (readOnly) {
    return (
      <span
        className={cn(starRatingVariants({ size }), className)}
        role="img"
        aria-label={`${value}/${max}`}
        {...props}
      >
        {stars.map((star) => (
          <span
            key={star}
            className={star <= value ? "text-yellow-500" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <div
      className={cn(starRatingVariants({ size }), className)}
      role="radiogroup"
      aria-label="별점"
      {...props}
    >
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "cursor-pointer transition-colors",
            star <= value ? "text-yellow-500" : "text-gray-300",
          )}
          onClick={() => onChange?.(star)}
          aria-label={`${star}점`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
