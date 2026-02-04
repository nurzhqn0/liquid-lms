import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";

export default function CoursesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiFetch("/api/courses")
  });
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error.message}</div>;
  }

  const courses = data?.courses || [];

  const levels = useMemo(() => {
    const all = courses.map((course) => course.level).filter(Boolean);
    return ["all", ...Array.from(new Set(all))];
  }, [courses]);

  const categories = useMemo(() => {
    const all = courses.map((course) => course.category).filter(Boolean);
    return ["all", ...Array.from(new Set(all))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesLevel = level === "all" || course.level === level;
      const matchesCategory = category === "all" || course.category === category;
      const matchesQuery =
        !query ||
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        (course.tags || []).some((tag) => tag.toLowerCase().includes(query));

      return matchesLevel && matchesCategory && matchesQuery;
    });
  }, [courses, search, level, category]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-wide text-ink/60">Search</label>
          <Input
            placeholder="Search by title, description, or tag..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Level</label>
            <Select value={level} onChange={(event) => setLevel(event.target.value)}>
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All levels" : item}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Category</label>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All categories" : item}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredCourses.map((course) => (
          <Card key={course._id} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-teal/10" />
            <CardHeader>
              <Badge variant="default">{course.level || "All levels"}</Badge>
              <CardTitle className="mt-3 text-xl">
                <Link to={`/courses/${course._id}`}>{course.title}</Link>
              </CardTitle>
              <p className="text-sm text-ink/60">{course.instructor_name}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink/70">{course.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(course.tags || []).slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="warning">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCourses.length === 0 && (
          <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 text-sm text-ink/60">
            No courses match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
