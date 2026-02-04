import React from "react";
import { cn } from "../../lib/utils.js";

const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-2 text-sm shadow-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20",
        className
      )}
      {...props}
    />
  );
});

export { Input };
