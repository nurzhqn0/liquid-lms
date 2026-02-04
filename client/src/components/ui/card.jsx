import React from "react";
import { cn } from "../../lib/utils.js";

const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-sm backdrop-blur",
        className
      )}
      {...props}
    />
  );
});

const CardHeader = ({ className, ...props }) => (
  <div className={cn("mb-4", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-ink/70", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("space-y-3", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={cn("mt-4 flex items-center justify-between", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
