import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm flex items-start gap-3 transition-all",
  {
    variants: {
      variant: {
        info: "bg-blue-500/10 text-blue-300 border-blue-500/20 [&>svg]:text-blue-400",
        success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 [&>svg]:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-300 border-amber-500/20 [&>svg]:text-amber-400",
        danger: "bg-red-500/10 text-red-300 border-red-500/20 [&>svg]:text-red-400",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  const Icon = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
  }[variant || "info"];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        {title && <h5 className="font-semibold leading-none tracking-tight text-white">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

export { Alert };
