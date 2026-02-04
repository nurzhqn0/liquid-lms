import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";
import { useToast } from "../components/ui/toast.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student"
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const newUser = await register(form);
      toast({ title: "Account created", description: "Welcome to Liquid LMS." });
      if (newUser?.role === "instructor") {
        navigate("/instructor/courses");
      } else {
        navigate("/courses");
      }
    } catch (err) {
      toast({ title: "Registration failed", description: err.message, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Username</label>
        <Input value={form.username} onChange={handleChange("username")} required />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Email</label>
        <Input type="email" value={form.email} onChange={handleChange("email")} required />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Password</label>
        <Input type="password" value={form.password} onChange={handleChange("password")} required />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">First Name</label>
          <Input value={form.first_name} onChange={handleChange("first_name")} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Last Name</label>
          <Input value={form.last_name} onChange={handleChange("last_name")} />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Role</label>
        <Select value={form.role} onChange={handleChange("role")}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        Already have an account? <Link className="font-medium text-teal" to="/login">Sign in</Link>
      </p>
    </form>
  );
}
