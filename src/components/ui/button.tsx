import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "success";
  size?: "sm" | "md" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" &&
            "border-cyan-300/30 bg-cyan-400/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.18)] hover:bg-cyan-400/25",
          variant === "ghost" && "border-transparent bg-transparent text-slate-200 hover:bg-white/[0.08] hover:text-white",
          variant === "outline" && "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-300/10",
          variant === "success" && "border-emerald-300/25 bg-emerald-400/12 text-emerald-100 hover:bg-emerald-400/20",
          size === "sm" && "h-8 px-3",
          size === "md" && "h-10 px-4",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
