import React from "react";
import { useAuth } from "../providers/AuthProvider.jsx";
import { Button } from "./ui/button.jsx";

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-white/70 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-medium text-ink/60 lg:hidden"
        >
          Menu
        </button>
        <p className="font-display text-2xl text-ink">{title}</p>
        <p className="text-xs text-ink/60">Build your learning momentum</p>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium">{user.first_name || user.username}</p>
            <p className="text-xs text-ink/60">{user.role}</p>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
