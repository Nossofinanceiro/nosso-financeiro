import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-all select-none",
  {
    variants: {
      variant: {
        success:
          "bg-primary/10 text-primary border-primary/20",
        warning:
          "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger:
          "bg-danger/10 text-danger border-danger/20",
        info:
          "bg-blue-500/10 text-blue-400 border-blue-500/20",
        neutral:
          "bg-surface-secondary text-foreground border-border-subtle/60",
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
