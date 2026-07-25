import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string; // Expects ISO YYYY-MM-DD string
  onChange?: (isoDate: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  helperText,
  id,
  className,
  disabled,
  ...props
}: DatePickerProps) {
  const generatedId = React.useId();
  const dateId = id || generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={dateId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <Calendar className="absolute left-3 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="date"
          id={dateId}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full bg-background/60 border border-border text-foreground placeholder-gray-500 rounded-lg text-sm pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]",
            error && "border-danger/60 focus:ring-red-500",
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-danger mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
