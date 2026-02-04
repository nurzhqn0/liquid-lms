import React from "react";
import { cn } from "../../lib/utils.js";

const ToastContext = React.createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(({ title, description, variant = "default" }) => {
    const id = idCounter++;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastViewport({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed right-6 top-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "min-w-[240px] rounded-2xl border border-ink/10 bg-white p-4 shadow-lg",
            toast.variant === "success" && "border-teal/40",
            toast.variant === "error" && "border-red-300"
          )}
        >
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-xs text-ink/60">{toast.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
