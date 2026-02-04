import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { useAuth } from "../providers/AuthProvider.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Input } from "../components/ui/input.jsx";
import { useToast } from "../components/ui/toast.jsx";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [review, setReview] = useState({ rating: 5, title: "", comment: "" });

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["courses", id],
    queryFn: () => apiFetch(`/api/courses/${id}`)
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments", id],
    queryFn: () => apiFetch(`/api/courses/${id}/assignments`)
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => apiFetch(`/api/courses/${id}/reviews`)
  });

  const { data: enrollmentsData } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => apiFetch("/api/enrollments/me"),
    enabled: user?.role === "student"
  });

  const isEnrolled = useMemo(() => {
    if (!enrollmentsData?.enrollments) return false;
    return enrollmentsData.enrollments.some(
      (enrollment) => String(enrollment.course_id) === String(id)
    );
  }, [enrollmentsData, id]);

  const enrollMutation = useMutation({
    mutationFn: () => apiFetch(`/api/courses/${id}/enroll`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Enrolled", description: "You are now enrolled." });
    },
    onError: (err) => toast({ title: "Enroll failed", description: err.message, variant: "error" })
  });

  const unenrollMutation = useMutation({
    mutationFn: () => apiFetch(`/api/courses/${id}/enroll`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Unenrolled", description: "Enrollment removed." });
    },
    onError: (err) => toast({ title: "Unenroll failed", description: err.message, variant: "error" })
  });

  const reviewMutation = useMutation({
    mutationFn: () => apiFetch(`/api/courses/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify(review)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      setReview({ rating: 5, title: "", comment: "" });
      toast({ title: "Review posted" });
    },
    onError: (err) => toast({ title: "Review failed", description: err.message, variant: "error" })
  });

  if (isLoading) {
    return <div>Loading course...</div>;
  }

  const course = courseData.course;
  const assignments = assignmentsData?.assignments || [];
  const reviews = reviewsData?.reviews || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Badge variant="default">{course.level}</Badge>
          <CardTitle className="mt-3 text-2xl font-display">{course.title}</CardTitle>
          <p className="text-sm text-ink/60">{course.instructor_name}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink/70">{course.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(course.learning_objectives || []).slice(0, 4).map((objective) => (
              <Badge key={objective} variant="warning">{objective}</Badge>
            ))}
          </div>
          {user?.role === "student" && (
            <div className="mt-6">
              {isEnrolled ? (
                <Button variant="outline" onClick={() => unenrollMutation.mutate()}>
                  Unenroll
                </Button>
              ) : (
                <Button onClick={() => enrollMutation.mutate()}>Enroll</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Modules & Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(course.modules || []).map((module) => (
                <div key={module.module_id} className="rounded-2xl border border-ink/10 p-4">
                  <p className="font-medium">{module.title}</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink/60">
                    {(module.lessons || []).map((lesson) => (
                      <li key={lesson.lesson_id}>{lesson.title}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.length === 0 && <p className="text-sm text-ink/60">No assignments yet.</p>}
              {assignments.map((assignment) => (
                <div key={assignment._id} className="flex items-center justify-between rounded-2xl border border-ink/10 p-3">
                  <div>
                    <p className="text-sm font-medium">{assignment.title}</p>
                    <p className="text-xs text-ink/60">{assignment.type}</p>
                  </div>
                  <Link className="text-sm font-semibold text-teal" to={`/assignments/${assignment._id}`}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((reviewItem) => (
              <div key={reviewItem._id} className="rounded-2xl border border-ink/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{reviewItem.user_name || "Student"}</p>
                  <Badge variant="success">{reviewItem.rating}★</Badge>
                </div>
                <p className="mt-2 text-sm text-ink/70">{reviewItem.comment}</p>
              </div>
            ))}
          </div>

          {user?.role === "student" && (
            <form
              className="mt-6 space-y-3 rounded-2xl border border-ink/10 bg-white/60 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                reviewMutation.mutate();
              }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-wide text-ink/60">Rating</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={review.rating}
                    onChange={(event) => setReview((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-ink/60">Title</label>
                  <Input
                    value={review.title}
                    onChange={(event) => setReview((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-ink/60">Comment</label>
                <Textarea
                  value={review.comment}
                  onChange={(event) => setReview((prev) => ({ ...prev, comment: event.target.value }))}
                />
              </div>
              <Button type="submit" disabled={reviewMutation.isPending}>Submit Review</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
