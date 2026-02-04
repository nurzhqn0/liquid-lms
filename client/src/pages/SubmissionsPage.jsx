import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";
import { Table, TableCell, TableHead, TableRow } from "../components/ui/table.jsx";
import { Badge } from "../components/ui/badge.jsx";

export default function SubmissionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => apiFetch("/api/submissions/me")
  });

  if (isLoading) {
    return <div>Loading submissions...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error.message}</div>;
  }

  const submissions = data.submissions || [];

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/80 p-6">
      <Table>
        <thead>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <TableRow key={submission._id}>
              <TableCell>{submission.assignment_id}</TableCell>
              <TableCell>
                <Badge variant={submission.status === "graded" ? "success" : "default"}>
                  {submission.status}
                </Badge>
              </TableCell>
              <TableCell>{submission.score ?? "-"}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
