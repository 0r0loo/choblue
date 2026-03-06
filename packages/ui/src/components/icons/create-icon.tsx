import type { IconProps } from "./types";

function createIcon(name: string, paths: React.ReactNode) {
  const Icon = ({ size = 24, className, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {paths}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

export { createIcon };
