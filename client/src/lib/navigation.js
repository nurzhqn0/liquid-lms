export function getNavSections(user) {
  const sections = [];

  if (user?.role !== "instructor") {
    sections.push({
      title: "Student",
      links: [
        { to: "/courses", label: "Courses" },
        { to: "/my-courses", label: "My Courses" },
        { to: "/submissions", label: "My Submissions" }
      ]
    });
  }

  if (user?.role === "instructor") {
    sections.push({
      title: "Instructor",
      links: [{ to: "/instructor/courses", label: "Instructor Hub" }]
    });
  }

  return sections;
}
