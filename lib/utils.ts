import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  const symbolFormatted = formatted.replace("$", "US$ ");

  if (value > 0) {
    return `+${symbolFormatted}`;
  } else if (value < 0) {
    return `-${symbolFormatted}`;
  }
  return symbolFormatted;
}
