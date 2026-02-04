import React from "react";
import { cn } from "../../lib/utils.js";

const variants = {
  primary: "bg-teal text-white hover:bg-teal/90",
  secondary: "bg-ember text-ink hover:bg-ember/90",
  outline: "border border-ink/20 hover:border-ink/40",
  ghost: "hover:bg-ink/5"
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base"
};

const Button = React.forwardRef(function Button(
  { className, variant = "primary", size = "md", asChild = false, children, ...props },
  ref
) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(children.props.className, classes)
    });
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

export { Button };
