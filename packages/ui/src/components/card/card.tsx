import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type CardProps = ComponentProps<"div">;

function Card({ className, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-black/5 dark:border-white/10 bg-card text-card-foreground shadow-md",
        className,
      )}
      {...props}
    />
  );
}

Card.displayName = "Card";

type CardHeaderProps = ComponentProps<"div">;

function CardHeader({ className, ref, ...props }: CardHeaderProps) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

CardHeader.displayName = "CardHeader";

type CardTitleProps = ComponentProps<"h3">;

function CardTitle({ className, ref, ...props }: CardTitleProps) {
  return (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

CardTitle.displayName = "CardTitle";

type CardDescriptionProps = ComponentProps<"p">;

function CardDescription({ className, ref, ...props }: CardDescriptionProps) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

CardDescription.displayName = "CardDescription";

type CardContentProps = ComponentProps<"div">;

function CardContent({ className, ref, ...props }: CardContentProps) {
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  );
}

CardContent.displayName = "CardContent";

type CardFooterProps = ComponentProps<"div">;

function CardFooter({ className, ref, ...props }: CardFooterProps) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
};
