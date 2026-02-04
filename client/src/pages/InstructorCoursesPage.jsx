import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";
import { useAuth } from "../providers/AuthProvider.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiFetch("/api/courses")
  });

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  const courses = (data?.courses || []).filter((course) => String(course.instructor_id) === String(user.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink/60">Manage your courses and assignments.</p>
        </div>
        <Button asChild>
          <Link to="/instructor/courses/new">New Course</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {courses.map((course) => (
          <Card key={course._id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <p className="text-xs text-ink/60">{course.slug}</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/instructor/courses/${course._id}/edit`}>Edit</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/instructor/courses/${course._id}/assignments`}>Assignments</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/courses/${course._id}`}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
