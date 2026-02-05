# **Final Project Report — Liquid LMS**

### **Student**

Name: Nurzhan Izimbetov

GitHub: nurzhqn0

Project: Liquid LMS

Link: [https://cute-olive-5e9.notion.site/Endterm-2fc680ce2e2780abadb7ecf40320c599?source=copy_link](https://www.notion.so/Endterm-2fc680ce2e2780abadb7ecf40320c599?pvs=21)

---

### **1. Abstract**

Liquid LMS is a full‑stack Learning Management System (LMS) MVP designed to support instructor‑led course creation and student learning workflows. The system provides course modules, assignments, submissions, grading, reviews, and enrollment tracking. The project demonstrates a complete backend (Node.js + Express + MongoDB) and a responsive frontend (React + Vite + Tailwind + shadcn‑style UI), deployed to cloud platforms.

### **2. Problem Statement**

Traditional LMS platforms are often complex and slow to customize. This project builds a clean, focused LMS MVP that supports the core academic flows—creating courses and lessons, enrolling students, handling assignments, grading, and collecting reviews—with a modern UI and scalable data model.

### **3. Objectives**

- Build a functional LMS MVP with real CRUD workflows.
- Support student and instructor roles.
- Provide clean REST APIs with authentication.
- Deliver a responsive UI for both roles.
- Deploy and validate in production.

### **4. Scope**

Included:

- Auth: register, login, logout, current user
- Courses: list, detail, create/edit (instructor)
- Lessons: embedded within course modules
- Enrollments: enroll, unenroll, list my enrollments
- Assignments: create/edit/delete, list by course
- Submissions: create, list, grade
- Reviews: list and create
- Swagger API docs
- Deployment to Railway / DigitalOcean

Excluded:

- Payments, certificates, analytics dashboard
- File uploads
- Email notifications
- Discussion boards

### **5. System Architecture**

Backend:

- Node.js + Express
- MongoDB + Mongoose
- JWT auth stored in HttpOnly cookies

Frontend:

- React + Vite
- Tailwind CSS (shadcn‑style components)
- React Router + React Query

Deployment:

- DigitalOcean App Platform

### **6. Data Model Highlights**

- `users`: username, email, role, preferences, stats
- `courses`: modules/lessons embedded, metadata, statistics, ratings
- `enrollments`: progress, completion, notes, bookmarks
- `assignments`: rubric, test cases, avg score, submissions count
- `submissions`: grading, feedback, time spent
- `reviews`: rating, verified purchase, instructor response

### **7. Backend API Summary**

**Auth**

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`

**Courses**

- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PATCH /api/courses/:id`

**Enrollments**

- `POST /api/courses/:id/enroll`
- `DELETE /api/courses/:id/enroll`
- `GET /api/enrollments/me`

**Assignments**

- `GET /api/courses/:id/assignments`
- `POST /api/courses/:id/assignments`
- `GET /api/assignments/:id`
- `PATCH /api/assignments/:id`
- `DELETE /api/assignments/:id`

**Submissions**

- `POST /api/assignments/:id/submissions`
- `GET /api/assignments/:id/submissions`
- `GET /api/submissions/me`
- `PATCH /api/submissions/:id`

**Reviews**

- `GET /api/courses/:id/reviews`
- `POST /api/courses/:id/reviews`
- `DELETE /api/reviews/:id`

### **8. Frontend Screens**

- Landing page
- Login / Register
- Course Catalog
- Course Detail (modules, assignments, reviews, enroll)
- My Courses (student enrollments)
- Assignment Detail (submit)
- My Submissions
- Instructor Hub
- Instructor Course Create/Edit
- Instructor Assignments
- Instructor Submissions (grading)

### **9. Testing & Validation**

- Manual testing of all API endpoints via Swagger and curl script
- Verified authentication and role‑based access
- Verified enroll, submit, grade, and review workflows
- Confirmed CORS behavior in production

### **Test Scenarios**

- Student login → enroll course → submit assignment
- Instructor login → create course → create assignment → grade submission
- Reviews created and reflected in course ratings
- Enrollment stats updated on enroll/unenroll

### **10. Deployment Notes**

- Frontend deployed as Static Site (Vite build output `/dist`)
- Backend deployed as Web Service with environment variables
- CORS configured with `CLIENT_ORIGIN`
- `SameSite=None` for cookies in production

### **11. Limitations**

- No file upload support
- No analytics charts
- Lesson content editing is basic
- No password recovery

### **12. Future Improvements**

- File uploads for submissions and resources
- Instructor dashboards with analytics
- Student certificates on completion
- Real‑time notifications

### **13. Repository & Demo**

- GitHub: [`https://github.com/nurzhqn0/liquid-lms`](https://github.com/nurzhqn0/liquid-lms)
- Frontend URL: [`https://sea-turtle-app-ufci5.ondigitalocean.app`](https://sea-turtle-app-ufci5.ondigitalocean.app)
- Backend URL: [`https://sea-turtle-app-ufci5.ondigitalocean.app/api`](https://sea-turtle-app-ufci5.ondigitalocean.app/api)

---
