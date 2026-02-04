import React from "react";
import { cn } from "../../lib/utils.js";

function Badge({ className, variant = "default", ...props }) {
  const styles = {
    default: "bg-ink/10 text-ink",
    success: "bg-teal/15 text-teal",
    warning: "bg-ember/20 text-ink"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
