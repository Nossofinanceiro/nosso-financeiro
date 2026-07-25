import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-all select-none",
  {
    variants: {
      variant: {
        success:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger:
          "bg-red-500/10 text-red-400 border-red-500/20",
        info:
          "bg-blue-500/10 text-blue-400 border-blue-500/20",
        neutral:
          "bg-gray-800 text-gray-300 border-gray-700/60",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
