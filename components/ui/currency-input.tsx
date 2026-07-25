"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number; // Clean numeric value (e.g. 1250.50)
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  helperText?: string;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  error,
  helperText,
  id,
  className,
  disabled,
  ...props
}: CurrencyInputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const displayValue = value === 0 || isNaN(value) ? "" : value.toString();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");

    // Allow single decimal point
    const parts = raw.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;

    const num = parseFloat(raw);
    onChange(isNaN(num) ? 0 : num);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center gap-1 text-gray-400 font-medium text-xs pointer-events-none select-none">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>US$</span>
        </div>

        <input
          type="text"
          id={inputId}
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.00"
          className={cn(
            "w-full bg-gray-950/60 border border-gray-800 text-gray-100 placeholder-gray-500 rounded-lg text-sm pl-14 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono",
            error && "border-red-500/60 focus:ring-red-500",
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
