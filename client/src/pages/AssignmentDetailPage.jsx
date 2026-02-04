import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { useToast } from "../components/ui/toast.jsx";

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submission, setSubmission] = useState("# Write your solution here");

  const { data, isLoading } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => apiFetch(`/api/assignments/${id}`)
  });

  const submissionMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/assignments/${id}/submissions`, {
        method: "POST",
        body: JSON.stringify({ submission_content: { code: submission } })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast({ title: "Submission sent" });
    },
    onError: (err) => toast({ title: "Submission failed", description: err.message, variant: "error" })
  });

  if (isLoading) {
    return <div>Loading assignment...</div>;
  }

  const assignment = data.assignment;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
          <p className="text-sm text-ink/60">{assignment.description}</p>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-ink/70">
            {(assignment.instructions || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={10} value={submission} onChange={(e) => setSubmission(e.target.value)} />
          <Button onClick={() => submissionMutation.mutate()} disabled={submissionMutation.isPending}>
            Submit Assignment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
