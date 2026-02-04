import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";

const highlights = [
  {
    title: "Structured learning",
    text: "Organize modules, lessons, and assignments in one clear flow.",
  },
  {
    title: "Instructor tools",
    text: "Create courses, manage assignments, and grade submissions in minutes.",
  },
  {
    title: "Student progress",
    text: "Enroll, submit work, and track completion effortlessly.",
  },
  {
    title: "Feedback loop",
    text: "Collect reviews and strengthen every learning experience.",
  },
];

const steps = [
  "Draft course structure in minutes",
  "Publish assignments and review submissions",
  "Refine learning paths with feedback",
];

const stats = [
  { label: "Active modules", value: "12" },
  { label: "Avg. rating", value: "4.7" },
  { label: "Assignments graded", value: "540+" },
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

      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-2">
        <div className="absolute -top-10 left-1/3 h-36 w-36 rounded-full bg-teal/10 blur-3xl" />
        <div className="space-y-6">
          <Badge variant="warning">Modern learning stack</Badge>
          <h1 className="font-display text-4xl text-ink md:text-5xl">
            The learning studio for focused courses and confident instructors.
          </h1>
          <p className="text-base text-ink/70">
            Liquid LMS helps instructors craft structured curricula while
            students stay on track. Build modules, assignments, grading, and
            reviews in one adaptive workflow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/register">Create an account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Continue learning</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-ink/50">
            <span>Role-based access</span>
            <span>Assignments & grading</span>
            <span>Course analytics-ready</span>
          </div>
        </div>
        <Card className="relative overflow-hidden shadow-glow">
          <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-ember/20" />
          <CardHeader>
            <CardTitle>Today’s studio</CardTitle>
            <p className="text-sm text-ink/60">
              Preview the workflow in one glance.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-ink/10 bg-white/80 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-ink/40">
                  Step {index + 1}
                </p>
                <p className="text-sm font-medium text-ink">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-4 rounded-3xl border border-ink/10 bg-white/70 p-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-ink/50">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold text-ink">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-ink/50">
              Why Liquid LMS
            </p>
            <h2 className="font-display text-3xl text-ink">
              Everything you need to teach with clarity.
            </h2>
            <p className="text-sm text-ink/70">
              From course architecture to grading and review collection, Liquid
              LMS keeps every teaching motion in one workspace. Build once,
              iterate fast.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-wide text-ink/50">
              Start now
            </p>
            <h3 className="font-display text-2xl text-ink">
              Launch your next course in minutes.
            </h3>
            <p className="text-sm text-ink/70">
              Invite students, publish assignments, and keep every lesson
              aligned.
            </p>
          </div>
          <Button asChild>
            <Link to="/register">Get started free</Link>
          </Button>
        </Card>
      </section>

      <footer className="border-t border-ink/10 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-6 py-6 text-sm text-ink/60">
          <span>
            Made by{" "}
            <a
              href="https://github.com/nurzhqn0"
              className="font-medium text-ink hover:text-teal"
              target="_blank"
              rel="noreferrer"
            >
              nurzhqn0
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
