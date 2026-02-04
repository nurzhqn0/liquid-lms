import React from "react";
import { cn } from "../../lib/utils.js";

const DialogContext = React.createContext(null);

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogContent({ className, children }) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className={cn("w-full max-w-lg rounded-3xl bg-white p-6 shadow-lg", className)}>
        <button
          type="button"
          className="ml-auto block text-sm text-ink/60"
          onClick={() => onOpenChange?.(false)}
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
}

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("mb-4", className)} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-ink/60", className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
