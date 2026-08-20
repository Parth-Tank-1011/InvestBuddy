import React, { useState } from "react";
import { ArrowRight, BarChart3, Lock, Mail, User } from "lucide-react";
import { registerUser } from "../services/api";

function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const data = await registerUser(form);
      setMessage(data.message || "Registration successful. You can log in now.");
      setForm({ username: "", email: "", password: "" });
      setTimeout(() => onNavigate("login"), 800);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden min-h-screen items-center p-10 lg:flex">
        <div className="max-w-2xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <BarChart3 size={24} />
            </span>
            <div>
              <p className="text-2xl font-black text-[var(--text)]">InvestBuddy</p>
              <p className="text-sm text-[var(--text-muted)]">Premium stock market workspace</p>
            </div>
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-[var(--text)]">
            Build your personal market desk in minutes.
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {["Research cards", "Market stories", "Risk baskets"].map((item) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-[var(--text)] backdrop-blur-xl" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="premium-panel mx-auto w-full max-w-md p-6 sm:p-8">
          <div className="mb-7">
            <p className="section-kicker">Join InvestBuddy</p>
            <h2 className="mt-2 text-3xl font-black text-[var(--text)]">Create your account</h2>
          </div>

          {error ? <p className="mb-4 rounded-2xl bg-[var(--danger)]/10 px-4 py-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
          {message ? <p className="mb-4 rounded-2xl bg-[var(--success)]/10 px-4 py-3 text-sm font-bold text-[var(--success)]">{message}</p> : null}

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                autoComplete="username"
                className="fintech-input w-full pl-11"
                name="username"
                onChange={handleChange}
                placeholder="Username"
                required
                type="text"
                value={form.username}
              />
            </label>
            <label className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                autoComplete="email"
                className="fintech-input w-full pl-11"
                name="email"
                onChange={handleChange}
                placeholder="Email"
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                autoComplete="new-password"
                className="fintech-input w-full pl-11"
                minLength={6}
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                type="password"
                value={form.password}
              />
            </label>
            <button className="primary-button w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Register"}
              <ArrowRight size={18} />
            </button>
          </form>

          <button
            className="mt-5 text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
            onClick={() => onNavigate("login")}
            type="button"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
