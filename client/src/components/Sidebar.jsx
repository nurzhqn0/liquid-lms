import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.jsx";
import { cn } from "../lib/utils.js";
import { getNavSections } from "../lib/navigation.js";

const baseLink =
  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition";

export default function Sidebar() {
  const { user } = useAuth();

  const sections = getNavSections(user);

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-ink/10 bg-white/70 p-6 backdrop-blur lg:block">
      <div className="mb-10">
        <p className="font-display text-2xl">Liquid LMS</p>
        <p className="text-xs text-ink/60">Learning Studio</p>
      </div>

      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-ink/40">{section.title}</p>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
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
    </aside>
  );
}
