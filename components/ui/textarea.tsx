import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          disabled={disabled}
          className={cn(
            "w-full min-h-[90px] bg-background/60 border border-border text-foreground placeholder-gray-500 rounded-lg text-sm p-3.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-y",
            error && "border-danger/60 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />

        {error ? (
          <p className="text-xs text-danger mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
