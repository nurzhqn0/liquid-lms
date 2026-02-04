import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar.jsx";
import Topbar from "../Topbar.jsx";
import MobileNav from "../MobileNav.jsx";

function resolveTitle(pathname) {
  if (pathname === "/courses") return "Courses";
  if (pathname === "/my-courses" || pathname === "/enrollments") return "My Courses";
  if (pathname === "/submissions") return "My Submissions";
  if (pathname === "/instructor/courses") return "Instructor Hub";
  if (pathname === "/instructor/courses/new") return "Create Course";
  if (pathname.includes("/instructor/courses/") && pathname.endsWith("/edit")) {
    return "Edit Course";
  }
  if (pathname.includes("/instructor/courses/") && pathname.endsWith("/assignments")) {
    return "Course Assignments";
  }
  if (pathname.includes("/instructor/assignments/") && pathname.endsWith("/submissions")) {
    return "Grade Submissions";
  }
  return "Liquid LMS";
}

export default function AppLayout() {
  const location = useLocation();
  const title = resolveTitle(location.pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 space-y-6 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
