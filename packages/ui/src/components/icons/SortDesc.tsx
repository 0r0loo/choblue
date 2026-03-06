import type { IconProps } from "./types";

function SortDesc({ size = 24, className, ...props }: IconProps) {
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
      <path d="M12 18l-6-8h12l-6 8z" />
    </svg>
  );
}

SortDesc.displayName = "SortDesc";

export { SortDesc };
