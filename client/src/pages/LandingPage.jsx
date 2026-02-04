import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";

const highlights = [
  {
    title: "Structured learning",
    text: "Organize modules, lessons, and assignments in one clear flow."
  },
  {
    title: "Instructor tools",
    text: "Create courses, manage assignments, and grade submissions in minutes."
  },
  {
    title: "Student progress",
    text: "Enroll, submit work, and track completion effortlessly."
  }
];

const steps = [
  "Create your course and build modules",
  "Publish assignments and review submissions",
  "Grow student progress and feedback"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="font-display text-2xl text-ink">Liquid LMS</p>
          <p className="text-xs text-ink/60">Learning Studio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Badge variant="warning">New • Modular LMS</Badge>
          <h1 className="font-display text-4xl text-ink md:text-5xl">
            Build immersive learning paths with clarity and speed.
          </h1>
          <p className="text-base text-ink/70">
            Liquid LMS helps instructors design structured courses and students stay focused. Create
            modules, assignments, and reviews in a modern workflow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/register">Create an account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Continue learning</Link>
            </Button>
          </div>
          <div className="flex gap-6 text-xs text-ink/50">
            <span>Role-based access</span>
            <span>Assignments & grading</span>
            <span>Course analytics-ready</span>
          </div>
        </div>
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Today’s studio</CardTitle>
            <p className="text-sm text-ink/60">Preview the workflow in one glance.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-wide text-ink/40">Step {index + 1}</p>
                <p className="text-sm font-medium text-ink">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink/70">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
