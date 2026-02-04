import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Table, TableCell, TableHead, TableRow } from "../components/ui/table.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog.jsx";
import { useToast } from "../components/ui/toast.jsx";

export default function InstructorSubmissionsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [grades, setGrades] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["assignment-submissions", id],
    queryFn: () => apiFetch(`/api/assignments/${id}/submissions`)
  });

  const submissions = data?.submissions || [];

  const mutation = useMutation({
    mutationFn: ({ submissionId, payload }) =>
      apiFetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-submissions", id] });
      toast({ title: "Submission graded" });
    },
    onError: (err) => toast({ title: "Update failed", description: err.message, variant: "error" })
  });

  const initialGrades = useMemo(() => {
    const map = {};
    submissions.forEach((submission) => {
      map[submission._id] = {
        score: submission.score ?? "",
        feedback: submission.feedback ?? ""
      };
    });
    return map;
  }, [submissions]);

  React.useEffect(() => {
    if (submissions.length) {
      setGrades((prev) => ({ ...initialGrades, ...prev }));
    }
  }, [initialGrades, submissions.length]);

  if (isLoading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/80 p-6">
      <Table>
        <thead>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <TableRow key={submission._id}>
              <TableCell>{submission.user_name || submission.user_id}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setDialogOpen(true);
                  }}
                >
                  View
                </Button>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  className="w-24"
                  value={grades[submission._id]?.score ?? ""}
                  onChange={(event) =>
                    setGrades((prev) => ({
                      ...prev,
                      [submission._id]: {
                        ...prev[submission._id],
                        score: event.target.value
                      }
                    }))
                  }
                />
              </TableCell>
              <TableCell>
                <Textarea
                  rows={2}
                  value={grades[submission._id]?.feedback ?? ""}
                  onChange={(event) =>
                    setGrades((prev) => ({
                      ...prev,
                      [submission._id]: {
                        ...prev[submission._id],
                        feedback: event.target.value
                      }
                    }))
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() =>
                    mutation.mutate({
                      submissionId: submission._id,
                      payload: {
                        score: Number(grades[submission._id]?.score),
                        feedback: grades[submission._id]?.feedback,
                        status: "graded"
                      }
                    })
                  }
                >
                  Save
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedSubmission(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission Content</DialogTitle>
          </DialogHeader>
          <pre className="max-h-[60vh] overflow-auto rounded-2xl bg-ink/5 p-4 text-xs text-ink">
            {selectedSubmission?.submission_content?.code ||
              JSON.stringify(selectedSubmission?.submission_content, null, 2) ||
              "No content"}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
