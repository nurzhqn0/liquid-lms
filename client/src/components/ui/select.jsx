import React from "react";
import { cn } from "../../lib/utils.js";

const Select = React.forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-2 text-sm shadow-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export { Select };
