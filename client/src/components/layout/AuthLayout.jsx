import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.2),_transparent_45%)] px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-glow">
        <div className="mb-6 text-center">
          <p className="font-display text-3xl text-ink">Liquid LMS</p>
          <p className="text-sm text-ink/60">Sign in to continue learning</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
