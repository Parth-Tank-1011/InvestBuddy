import React, { useState } from "react";
import { FiBarChart2, FiColumns, FiMail, FiPieChart, FiTrendingUp, FiWatch } from "react-icons/fi";

const features = [
  { title: "Real-time stock insights", icon: FiTrendingUp },
  { title: "Market news updates", icon: FiMail },
  { title: "Portfolio suggestions", icon: FiPieChart },
  { title: "Watchlist tracking", icon: FiWatch },
  { title: "Stock comparison", icon: FiColumns },
];

function AboutPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert("Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <section className="page-shell space-y-8">
      <section className="premium-panel animate-fade-in p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">About</p>
            <h1 className="section-title">About InvestBuddy</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-theme-muted sm:text-base">
              InvestBuddy is a smart stock dashboard that helps users track stocks, view market news, manage
              watchlists, and generate sample portfolios.
            </p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-theme-accent/10 text-theme-accent ring-1 ring-theme-accent/25">
            <FiBarChart2 size={28} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="rounded-2xl border border-theme-border bg-theme-surface-soft p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
                key={feature.title}
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-theme-accent/10 text-theme-accent ring-1 ring-theme-accent/25">
                  <Icon size={19} />
                </span>
                <h2 className="text-base font-bold text-theme-text">{feature.title}</h2>
              </article>
            );
          })}
        </div>
      </section>

      <section className="premium-panel animate-fade-in p-6 sm:p-8">
        <div className="mb-6">
          <p className="section-kicker">Contact</p>
          <h2 className="mt-2 text-3xl font-black text-theme-text">Contact Us</h2>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="fintech-input w-full"
              style={{ backgroundColor: "var(--card)", color: "var(--text)" }}
              name="name"
              onChange={handleChange}
              placeholder="Name"
              required
              type="text"
              value={form.name}
            />
            <input
              className="fintech-input w-full"
              style={{ backgroundColor: "var(--card)", color: "var(--text)" }}
              name="email"
              onChange={handleChange}
              placeholder="Email"
              required
              type="email"
              value={form.email}
            />
          </div>

          <textarea
            className="fintech-input min-h-36 w-full resize-y py-3"
            style={{ backgroundColor: "var(--card)", color: "var(--text)" }}
            name="message"
            onChange={handleChange}
            placeholder="Message"
            required
            value={form.message}
          />

          <button
            className="primary-button w-fit px-6"
            type="submit"
          >
            Send Message
          </button>
        </form>
      </section>

      <footer className="pb-2 text-center text-sm text-theme-muted">
        © 2026 InvestBuddy. All rights reserved.
      </footer>
    </section>
  );
}

export default AboutPage;
