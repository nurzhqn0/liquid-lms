import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { useToast } from "../components/ui/toast.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const loggedInUser = await login(identifier, password);
      toast({ title: "Welcome back!", description: "Logged in successfully." });
      const fallback =
        loggedInUser?.role === "instructor" ? "/instructor/courses" : "/courses";
      const redirectTo = location.state?.from?.pathname || fallback;
      navigate(redirectTo);
    } catch (err) {
      toast({ title: "Login failed", description: err.message, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Email or Username</label>
        <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-ink/60">
        New here? <Link className="font-medium text-teal" to="/register">Create an account</Link>
      </p>
    </form>
  );
}
