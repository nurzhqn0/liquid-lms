import React from "react";
import { cn } from "../../lib/utils.js";

const TabsContext = React.createContext(null);

function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }) {
  return (
    <div className={cn("inline-flex rounded-full bg-ink/5 p-1", className)}>{children}</div>
  );
}

function TabsTrigger({ value, children, className }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      className={cn(
        "px-4 py-1.5 text-sm font-medium transition",
        active ? "rounded-full bg-white shadow" : "text-ink/60",
        className
      )}
      onClick={() => ctx?.onValueChange?.(value)}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className={cn("rounded-2xl", className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
