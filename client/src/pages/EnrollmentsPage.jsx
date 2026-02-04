import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";

export default function EnrollmentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => apiFetch("/api/enrollments/me")
  });

  if (isLoading) {
    return <div>Loading enrollments...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error.message}</div>;
  }

  const enrollments = data.enrollments || [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {enrollments.map((enrollment) => (
        <Card key={enrollment._id}>
          <CardHeader>
            <CardTitle className="text-lg">{enrollment.course_title}</CardTitle>
            <p className="text-xs text-ink/60">{enrollment.instructor_name}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="success">{enrollment.status}</Badge>
              <p className="text-sm text-ink/70">
                {enrollment.completion_percentage || 0}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
