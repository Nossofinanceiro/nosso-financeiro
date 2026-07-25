import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, onChange, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded border border-border-subtle bg-background/80 flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-gray-900 peer-checked:bg-primary peer-checked:border-emerald-600 peer-disabled:opacity-50 cursor-pointer peer-disabled:cursor-not-allowed",
              className
            )}
            onClick={(e) => {
              if (disabled) return;
              const inputEl = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (inputEl) inputEl.click();
            }}
          >
            <Check className="w-3 h-3 text-foreground opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>
        </div>

        {(label || description) && (
          <div className="text-sm">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "font-medium text-foreground cursor-pointer select-none",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
