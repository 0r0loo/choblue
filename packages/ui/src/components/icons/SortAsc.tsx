import type { IconProps } from "./types";

function SortAsc({ size = 24, className, ...props }: IconProps) {
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
      <path d="M12 6l6 8H6l6-8z" />
    </svg>
  );
}

SortAsc.displayName = "SortAsc";

export { SortAsc };
