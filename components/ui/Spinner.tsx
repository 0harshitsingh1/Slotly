import React from "react";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "white" | "current";
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

const variantClasses = {
  primary: "text-brand-600 dark:text-brand-400",
  secondary: "text-slate-600 dark:text-slate-400",
  white: "text-white",
  current: "text-current",
};

export function Spinner({
  size = "md",
  variant = "current",
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
