import type { IconProps } from "./types";

function SortDefault({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 5l5 6H7l5-6z" />
      <path d="M12 19l-5-6h10l-5 6z" />
    </svg>
  );
}

SortDefault.displayName = "SortDefault";

export { SortDefault };
