import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth.jsx";
import RequireRole from "./components/RequireRole.jsx";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import CourseDetailPage from "./pages/CourseDetailPage.jsx";
import MyCoursesPage from "./pages/MyCoursesPage.jsx";
import AssignmentDetailPage from "./pages/AssignmentDetailPage.jsx";
import SubmissionsPage from "./pages/SubmissionsPage.jsx";
import InstructorCoursesPage from "./pages/InstructorCoursesPage.jsx";
import CourseFormPage from "./pages/CourseFormPage.jsx";
import InstructorAssignmentsPage from "./pages/InstructorAssignmentsPage.jsx";
import InstructorSubmissionsPage from "./pages/InstructorSubmissionsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/enrollments" element={<MyCoursesPage />} />
          <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />

          <Route element={<RequireRole role="instructor" />}>
            <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
            <Route path="/instructor/courses/new" element={<CourseFormPage mode="create" />} />
            <Route path="/instructor/courses/:id/edit" element={<CourseFormPage mode="edit" />} />
            <Route path="/instructor/courses/:id/assignments" element={<InstructorAssignmentsPage />} />
            <Route
              path="/instructor/assignments/:id/submissions"
              element={<InstructorSubmissionsPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
