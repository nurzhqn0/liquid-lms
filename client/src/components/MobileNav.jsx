import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.jsx";
import { getNavSections } from "../lib/navigation.js";
import { cn } from "../lib/utils.js";

const baseLink =
  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition";

export default function MobileNav({ open, onClose }) {
  const { user } = useAuth();
  const sections = getNavSections(user);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-ink/40"
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
      />
      <div className="relative h-full w-72 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-xl">Liquid LMS</p>
          <button
            type="button"
            className="text-sm text-ink/60"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-ink/40">
                {section.title}
              </p>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      baseLink,
                      isActive ? "bg-ink text-white" : "hover:bg-ink/10"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
