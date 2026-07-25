import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 flex items-center justify-center text-muted pointer-events-none">
              {startIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            disabled={disabled}
            className={cn(
              "w-full bg-background/60 border border-border text-foreground placeholder-gray-500 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed",
              startIcon ? "pl-10" : "px-3.5",
              endIcon ? "pr-10" : "px-3.5",
              "py-2.5",
              error && "border-danger/60 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 flex items-center justify-center text-muted">
              {endIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-danger flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
