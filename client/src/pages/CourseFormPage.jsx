import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Select } from "../components/ui/select.jsx";
import { useToast } from "../components/ui/toast.jsx";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  category: "",
  subcategory: "",
  level: "beginner",
  language: "English",
  price: "",
  currency: "KZT",
  is_published: false,
  tags: "",
  learning_objectives: "",
  requirements: ""
};

const emptyLesson = () => ({
  lesson_id: "",
  title: "",
  content_type: "video",
  content_url: "",
  duration_minutes: "",
  order_number: "",
  is_preview: false,
  resources: []
});

const emptyModule = () => ({
  module_id: "",
  title: "",
  description: "",
  order_number: "",
  duration_minutes: "",
  lessons: [emptyLesson()]
});

function normalizeModules(modules) {
  return (modules || []).map((module) => ({
    ...module,
    module_id: module.module_id || "",
    title: module.title || "",
    description: module.description || "",
    order_number: module.order_number ?? "",
    duration_minutes: module.duration_minutes ?? "",
    lessons: (module.lessons || []).map((lesson) => ({
      ...lesson,
      lesson_id: lesson.lesson_id || "",
      title: lesson.title || "",
      content_type: lesson.content_type || "video",
      content_url: lesson.content_url || "",
      duration_minutes: lesson.duration_minutes ?? "",
      order_number: lesson.order_number ?? "",
      is_preview: Boolean(lesson.is_preview),
      resources: lesson.resources || []
    }))
  }));
}

export default function CourseFormPage({ mode }) {
  const { id } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [modules, setModules] = useState([emptyModule()]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["courses", id],
    queryFn: () => apiFetch(`/api/courses/${id}`),
    enabled: mode === "edit"
  });

  useEffect(() => {
    if (data?.course) {
      const course = data.course;
      setForm({
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        category: course.category || "",
        subcategory: course.subcategory || "",
        level: course.level || "beginner",
        language: course.language || "English",
        price: course.price ? String(course.price) : "",
        currency: course.currency || "KZT",
        is_published: Boolean(course.is_published),
        tags: (course.tags || []).join(", "),
        learning_objectives: (course.learning_objectives || []).join("\n"),
        requirements: (course.requirements || []).join("\n")
      });
      setModules(course.modules?.length ? normalizeModules(course.modules) : [emptyModule()]);
    }
  }, [data]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateModule = (index, updates) => {
    setModules((prev) => prev.map((module, idx) => (idx === index ? { ...module, ...updates } : module)));
  };

  const updateLesson = (moduleIndex, lessonIndex, updates) => {
    setModules((prev) =>
      prev.map((module, idx) => {
        if (idx !== moduleIndex) return module;
        const lessons = module.lessons.map((lesson, lidx) =>
          lidx === lessonIndex ? { ...lesson, ...updates } : lesson
        );
        return { ...module, lessons };
      })
    );
  };

  const addModule = () => setModules((prev) => [...prev, emptyModule()]);

  const removeModule = (index) =>
    setModules((prev) => prev.filter((_, idx) => idx !== index));

  const addLesson = (moduleIndex) =>
    setModules((prev) =>
      prev.map((module, idx) =>
        idx === moduleIndex
          ? { ...module, lessons: [...module.lessons, emptyLesson()] }
          : module
      )
    );

  const removeLesson = (moduleIndex, lessonIndex) =>
    setModules((prev) =>
      prev.map((module, idx) => {
        if (idx !== moduleIndex) return module;
        const lessons = module.lessons.filter((_, lidx) => lidx !== lessonIndex);
        return { ...module, lessons: lessons.length ? lessons : [emptyLesson()] };
      })
    );

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        level: form.level,
        language: form.language,
        price: form.price ? Number(form.price) : undefined,
        currency: form.currency,
        is_published: form.is_published,
        tags: form.tags
          ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
        learning_objectives: form.learning_objectives
          ? form.learning_objectives.split("\n").map((item) => item.trim()).filter(Boolean)
          : [],
        requirements: form.requirements
          ? form.requirements.split("\n").map((item) => item.trim()).filter(Boolean)
          : []
      };

      const modulePayload = modules
        .filter((module) => {
          const hasLessonContent = (module.lessons || []).some(
            (lesson) => lesson.title || lesson.content_url
          );
          return module.title || module.description || hasLessonContent;
        })
        .map((module, index) => ({
          ...module,
          module_id: module.module_id || `mod_${index + 1}`,
          title: module.title,
          description: module.description,
          order_number: module.order_number ? Number(module.order_number) : index + 1,
          duration_minutes: module.duration_minutes ? Number(module.duration_minutes) : undefined,
          lessons: (module.lessons || [])
            .filter((lesson) => lesson.title || lesson.content_url)
            .map((lesson, lessonIndex) => ({
              ...lesson,
              lesson_id: lesson.lesson_id || `les_${index + 1}_${lessonIndex + 1}`,
              title: lesson.title,
              content_type: lesson.content_type,
              content_url: lesson.content_url || null,
              duration_minutes: lesson.duration_minutes ? Number(lesson.duration_minutes) : undefined,
              order_number: lesson.order_number ? Number(lesson.order_number) : lessonIndex + 1,
              is_preview: Boolean(lesson.is_preview),
              resources: lesson.resources || []
            }))
        }));

      payload.modules = modulePayload;

      if (mode === "edit") {
        return apiFetch(`/api/courses/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      }

      return apiFetch("/api/courses", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course saved" });
      navigate("/instructor/courses");
    },
    onError: (err) => toast({ title: "Save failed", description: err.message, variant: "error" })
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Edit Course" : "Create Course"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Title</label>
            <Input value={form.title} onChange={handleChange("title")} required />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Slug</label>
            <Input value={form.slug} onChange={handleChange("slug")} required />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Description</label>
          <Textarea rows={3} value={form.description} onChange={handleChange("description")} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Category</label>
            <Input value={form.category} onChange={handleChange("category")} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Level</label>
            <Select value={form.level} onChange={handleChange("level")}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Language</label>
            <Input value={form.language} onChange={handleChange("language")} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Price</label>
            <Input type="number" value={form.price} onChange={handleChange("price")} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Currency</label>
            <Input value={form.currency} onChange={handleChange("currency")} />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Tags</label>
          <Input value={form.tags} onChange={handleChange("tags")} placeholder="python, data, web" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Learning Objectives</label>
            <Textarea rows={4} value={form.learning_objectives} onChange={handleChange("learning_objectives")} placeholder="One objective per line" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink/60">Requirements</label>
            <Textarea rows={4} value={form.requirements} onChange={handleChange("requirements")} placeholder="One requirement per line" />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-ink/10 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Modules & Lessons</p>
              <p className="text-xs text-ink/60">Build the course structure.</p>
            </div>
            <Button variant="outline" size="sm" onClick={addModule}>Add Module</Button>
          </div>
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <div key={`module-${moduleIndex}`} className="rounded-2xl border border-ink/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Module {moduleIndex + 1}</p>
                  <Button variant="ghost" size="sm" onClick={() => removeModule(moduleIndex)}>
                    Remove Module
                  </Button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-ink/60">Module Title</label>
                    <Input value={module.title} onChange={(e) => updateModule(moduleIndex, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-ink/60">Module ID</label>
                    <Input value={module.module_id} onChange={(e) => updateModule(moduleIndex, { module_id: e.target.value })} />
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-ink/60">Order</label>
                    <Input type="number" value={module.order_number} onChange={(e) => updateModule(moduleIndex, { order_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-ink/60">Duration (min)</label>
                    <Input type="number" value={module.duration_minutes} onChange={(e) => updateModule(moduleIndex, { duration_minutes: e.target.value })} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs uppercase tracking-wide text-ink/60">Description</label>
                  <Textarea rows={2} value={module.description} onChange={(e) => updateModule(moduleIndex, { description: e.target.value })} />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Lessons</p>
                    <Button variant="outline" size="sm" onClick={() => addLesson(moduleIndex)}>
                      Add Lesson
                    </Button>
                  </div>
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={`lesson-${lessonIndex}`} className="rounded-2xl border border-ink/10 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-ink/70">Lesson {lessonIndex + 1}</p>
                        <Button variant="ghost" size="sm" onClick={() => removeLesson(moduleIndex, lessonIndex)}>
                          Remove
                        </Button>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-xs uppercase tracking-wide text-ink/60">Lesson Title</label>
                          <Input value={lesson.title} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-ink/60">Lesson ID</label>
                          <Input value={lesson.lesson_id} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { lesson_id: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="text-xs uppercase tracking-wide text-ink/60">Type</label>
                          <Select value={lesson.content_type} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content_type: e.target.value })}>
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="article">Article</option>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-ink/60">Order</label>
                          <Input type="number" value={lesson.order_number} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { order_number: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wide text-ink/60">Duration (min)</label>
                          <Input type="number" value={lesson.duration_minutes} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { duration_minutes: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs uppercase tracking-wide text-ink/60">Content URL</label>
                        <Input value={lesson.content_url} onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content_url: e.target.value })} />
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-xs text-ink/70">
                        <input
                          type="checkbox"
                          checked={lesson.is_preview}
                          onChange={(e) => updateLesson(moduleIndex, lessonIndex, { is_preview: e.target.checked })}
                        />
                        Preview lesson
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.is_published} onChange={handleChange("is_published")} />
          Publish course
        </label>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mode === "edit" ? "Save Changes" : "Create Course"}
        </Button>
      </CardContent>
    </Card>
  );
}
