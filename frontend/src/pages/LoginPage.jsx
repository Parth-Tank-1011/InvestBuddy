import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Newspaper,
  PieChart,
  ShieldCheck,
  Star,
} from "lucide-react";
import { loginUser } from "../services/api";

function LoginPage({ onLogin, onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
      const data = await loginUser(form);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setMessage(data.message || "Login successful.");
      onLogin(data.user);
      onNavigate("search");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050b18]" style={{ color: 'var(--text)' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_18%,rgba(34,211,238,0.20),transparent_34%),radial-gradient(ellipse_at_76%_14%,rgba(37,99,235,0.24),transparent_36%),linear-gradient(135deg,#030712_0%,#071226_48%,#040816_100%)]" />
      <div className="auth-lighting absolute inset-0" />
      <div className="auth-grid absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1120px] flex-col items-center justify-center gap-10 px-5 py-10 sm:px-8 lg:flex-row lg:justify-between lg:gap-14 lg:px-8 lg:py-12 xl:px-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 hidden h-[560px] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-200/18 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.16)] lg:block"
          style={{ left: "calc(50% + 60px)" }}
        />
        <BrandPanel />

        <div className="flex w-full justify-center lg:w-[400px] lg:shrink-0">
          <div className="auth-card group w-full max-w-[400px] animate-fade-in rounded-[28px] border border-cyan-300/15 bg-[#081427]/72 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.62)] backdrop-blur-2xl transition-all duration-500 hover:border-cyan-300/25 hover:shadow-cyan-500/10 sm:p-8">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20">
                <ShieldCheck size={22} />
              </div>
              <p className="section-kicker">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Login to InvestBuddy</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Access your market desk, watchlists, and portfolio workspace.
              </p>
            </div>

            {error ? <p className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-300">{error}</p> : null}
            {message ? <p className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">{message}</p> : null}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <label className="group/input relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within/input:text-cyan-300" />
                <input
                  autoComplete="email"
                  className="auth-input fintech-input h-[52px] w-full pl-11 text-sm shadow-inner shadow-black/20"
                  name="email"
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  type="email"
                  value={form.email}
                />
              </label>

              <label className="group/input relative block">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within/input:text-cyan-300" />
                <input
                  autoComplete="current-password"
                  className="auth-input fintech-input h-[52px] w-full pl-11 pr-12 text-sm shadow-inner shadow-black/20"
                  name="password"
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-cyan-300"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-slate-400">
                  <input
                    checked={rememberMe}
                    className="h-4 w-4 rounded border-cyan-400/20 bg-white/5 accent-cyan-400"
                    onChange={(event) => setRememberMe(event.target.checked)}
                    type="checkbox"
                  />
                  Remember me
                </label>
                <button className="font-bold text-cyan-300 transition-colors duration-300 hover:text-cyan-200" type="button">
                  Forgot password?
                </button>
              </div>

              <button className="primary-button relative mt-2 h-12 w-full overflow-hidden rounded-2xl shadow-cyan-500/25 before:absolute before:inset-y-0 before:-left-1/3 before:w-1/3 before:bg-white/20 before:blur-xl before:transition-all before:duration-700 hover:before:left-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Logging in
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
              New to InvestBuddy?{" "}
              <button
                className="font-black text-cyan-300 transition-colors duration-300 hover:text-cyan-200"
                onClick={() => onNavigate("register")}
                type="button"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandPanel() {
  return (
    <div className="relative flex w-full items-center justify-center lg:w-[520px] lg:shrink-0">
      <div className="feature-panel relative w-full max-w-[520px] animate-fade-in overflow-hidden rounded-[32px] border border-cyan-200/14 bg-[#071528]/72 p-5 shadow-[0_34px_110px_rgba(0,0,0,0.54)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_26%,rgba(34,211,238,0.055)_70%,transparent)]" />
        <div className="absolute -bottom-24 left-8 h-56 w-[82%] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="feature-graph-glow absolute bottom-0 left-0 right-0 h-28 opacity-15" />

        <div className="relative flex items-center gap-4">
          <OfficialInvestBuddyLogo />
          <p className="text-2xl font-black text-white">InvestBuddy</p>
        </div>

        <h1 className="relative mt-5 max-w-xl font-black text-white sm:mt-6" style={{ fontSize: 'clamp(32px, 3.55vw, 46px)', lineHeight: 1.03, letterSpacing: 0 }}>
          Your Intelligent<br />
          <span className="bg-gradient-to-r from-cyan-200 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Investing</span> Workspace
        </h1>

        <div className="relative mt-5 divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {[
            {
              description: "Get intelligent stock analysis and predictions.",
              icon: BrainCircuit,
              title: "AI-Powered Insights",
            },
            {
              description: "Track and organize stocks that matter to you.",
              icon: Star,
              title: "Smart Watchlists",
            },
            {
              description: "Build optimized portfolios with ease.",
              icon: PieChart,
              title: "Portfolio Generator",
            },
            {
              description: "Stay updated with real-time market news.",
              icon: Newspaper,
              title: "Market News",
            },
            {
              description: "Deep dive into trends, charts and market data.",
              icon: BarChart3,
              title: "Advanced Analytics",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="flex items-start gap-3.5 px-4 py-3 sm:px-5" key={feature.title}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/16 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-sm font-black text-white sm:text-base">{feature.title}</span>
                  <span className="mt-0.5 block text-sm leading-5 text-slate-400">{feature.description}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OfficialInvestBuddyLogo() {
  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_28px_rgba(34,211,238,0.24),0_12px_28px_rgba(37,99,235,0.18)] ring-1 ring-cyan-300/20">
      <span className="absolute inset-0 rounded-xl bg-white/10 opacity-60" />
      <BarChart3 className="relative drop-shadow-[0_0_10px_rgba(255,255,255,0.20)]" size={22} strokeWidth={2.1} />
    </span>
  );
}

function InvestBuddyLogo({ compact = false }) {
  return (
    <span className={`investbuddy-logo relative flex shrink-0 items-center justify-center border border-cyan-200/24 bg-[#06172b]/82 shadow-[0_0_62px_rgba(34,211,238,0.34),0_22px_64px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.14)] ${compact ? "h-12 w-12 rounded-2xl" : "h-36 w-36 rounded-[34px] sm:h-44 sm:w-44 sm:rounded-[40px]"}`}>
      <svg className={compact ? "h-11 w-11" : "h-[132px] w-[132px] sm:h-[158px] sm:w-[158px]"} viewBox="0 0 160 160" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="investBuddyMark" x1="38" x2="106" y1="130" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0b4fb8" />
            <stop offset="0.48" stopColor="#0877dc" />
            <stop offset="1" stopColor="#1e9bff" />
          </linearGradient>
          <linearGradient id="investBuddyMarkDark" x1="70" x2="124" y1="132" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#063a8d" />
            <stop offset="1" stopColor="#0b62c7" />
          </linearGradient>
          <linearGradient id="investBuddyArrow" x1="36" x2="128" y1="118" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#05a05f" />
            <stop offset="0.55" stopColor="#2bbf34" />
            <stop offset="1" stopColor="#7de23c" />
          </linearGradient>
          <filter id="investBuddyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M34 34H55V125H34V34Z" fill="url(#investBuddyMark)" />
        <path d="M34 23H55V44H34V23Z" fill="url(#investBuddyMark)" />
        <path d="M64 34H93.5C113 34 124 43.2 124 58.6C124 67.2 119.8 74.1 112 78.3C122.4 82.1 129 90.1 129 101.2C129 117 117.4 125 94.6 125H64V34ZM91.1 69.7C100 69.7 104.6 65.7 104.6 58.7C104.6 51.8 99.8 48.2 90.6 48.2H82.4V69.7H91.1ZM94 110.7C103.9 110.7 108.9 106.7 108.9 98.7C108.9 90.7 103.7 86.5 93.6 86.5H82.4V110.7H94Z" fill="url(#investBuddyMarkDark)" />
        <path d="M39 118C59.6 107.6 77.8 94.4 93.6 78.2C103.5 68 112.7 58.5 121.2 49.5" stroke="#073f25" strokeLinecap="round" strokeWidth="11" opacity="0.65" />
        <path d="M38 115C59.4 104.8 77.7 91.7 93.2 76C104.2 64.8 114.3 54.5 123.6 45.1" stroke="url(#investBuddyArrow)" strokeLinecap="round" strokeWidth="8.5" filter="url(#investBuddyGlow)" />
        <path d="M118 38L140 35L136 57" stroke="url(#investBuddyArrow)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8.5" filter="url(#investBuddyGlow)" />
      </svg>
    </span>
  );
}

export default LoginPage;
