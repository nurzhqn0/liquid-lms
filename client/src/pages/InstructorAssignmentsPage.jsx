import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Select } from "../components/ui/select.jsx";
import { useToast } from "../components/ui/toast.jsx";

export default function InstructorAssignmentsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    lesson_id: "",
    max_score: 100,
    type: "coding",
    difficulty: "beginner",
    instructions: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["assignments", id],
    queryFn: () => apiFetch(`/api/courses/${id}/assignments`)
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/courses/${id}/assignments`, {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          lesson_id: form.lesson_id,
          max_score: Number(form.max_score),
          type: form.type,
          difficulty: form.difficulty,
          instructions: form.instructions.split("\n").filter(Boolean)
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", id] });
      toast({ title: "Assignment created" });
      setForm({
        title: "",
        description: "",
        lesson_id: "",
        max_score: 100,
        type: "coding",
        difficulty: "beginner",
        instructions: ""
      });
    },
    onError: (err) => toast({ title: "Create failed", description: err.message, variant: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: (assignmentId) =>
      apiFetch(`/api/assignments/${assignmentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", id] });
      toast({ title: "Assignment deleted" });
    },
    onError: (err) => toast({ title: "Delete failed", description: err.message, variant: "error" })
  });

  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

  const assignments = data.assignments || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Title</label>
            <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Description</label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Lesson ID</label>
            <Input value={form.lesson_id} onChange={(e) => setForm((prev) => ({ ...prev, lesson_id: e.target.value }))} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">Max Score</label>
              <Input type="number" value={form.max_score} onChange={(e) => setForm((prev) => ({ ...prev, max_score: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">Type</label>
              <Select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                <option value="coding">Coding</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">Difficulty</label>
              <Select value={form.difficulty} onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Instructions</label>
            <Textarea rows={4} value={form.instructions} onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            Create Assignment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="rounded-2xl border border-ink/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="text-xs text-ink/60">{assignment.type}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/instructor/assignments/${assignment._id}/submissions`}>Submissions</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(assignment._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {assignments.length === 0 && <p className="text-sm text-ink/60">No assignments yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
