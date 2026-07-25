import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const statCardVariants = cva(
  "rounded-2xl border p-5 transition-all shadow-lg flex flex-col justify-between space-y-3",
  {
    variants: {
      variant: {
        positive: "bg-[#111827] border-emerald-500/30 text-emerald-400",
        negative: "bg-[#111827] border-red-500/30 text-red-400",
        neutral: "bg-[#111827] border-gray-800/80 text-gray-100",
        highlight: "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-emerald-950/20",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: number; // Raw numeric value
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNegative?: boolean;
  };
  description?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  variant = "neutral",
  className,
  ...props
}: StatCardProps) {
  const isPositiveVal = value > 0;
  const isNegativeVal = value < 0;

  const valueColor = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: isPositiveVal
      ? "text-emerald-400"
      : isNegativeVal
      ? "text-red-400"
      : "text-white",
    highlight: "text-emerald-400",
  }[variant || "neutral"];

  return (
    <div className={cn(statCardVariants({ variant }), className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-gray-800/60 border border-gray-700/40 text-gray-300">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className={cn("text-2xl font-bold tracking-tight font-mono", valueColor)}>
          {formatCurrency(value)}
        </div>

        {(trend || description) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded",
                  trend.isPositive && "bg-emerald-500/10 text-emerald-400",
                  trend.isNegative && "bg-red-500/10 text-red-400",
                  !trend.isPositive && !trend.isNegative && "bg-gray-800 text-gray-400"
                )}
              >
                {trend.isPositive && <TrendingUp className="w-3 h-3" />}
                {trend.isNegative && <TrendingDown className="w-3 h-3" />}
                {!trend.isPositive && !trend.isNegative && <Minus className="w-3 h-3" />}
                <span>{trend.value}</span>
              </span>
            )}
            {description && (
              <span className="text-gray-400 truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
