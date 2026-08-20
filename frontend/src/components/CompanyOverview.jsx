import React, { useState, useRef, useCallback, useEffect } from "react";
import { Building2, User, MapPin, Calendar, DollarSign, Briefcase } from "lucide-react";
import { formatMarketCap } from "../utils/helpers";

const COLLAPSED_LINES = 5;
const CH      = 24;    // avg text line-height px
const PAD_V   = 22;    // top+bottom padding around the text
const COLLAPSED_MAX_PX = (COLLAPSED_LINES * CH) + PAD_V;  // ~= 140 px

/**
 * CompanyOverview
 *
 * Layout principles
 * ───────────────
 *  • Default: description clamped to 5 lines (−webkit-line-clamp), wrapper max-height covers it
 *  • "Read More": isExpanded flips → clamp lifted → JS measures the real content height
 *    and applies it as inline max-height so the CSS transition opens smoothly
 *  • "Show Less": inline height is set → isExpanded flips → two rAF layers lock the
 *    decoded clamp height → CSS max-height animates from full down to the collapsed cap
 *  • Outer flex-row uses `items-start`; right column uses `self-start` — so only the
 *    LEFT description area grows; right-side info cards stay at their natural compact size
 *
 * Layout diagram (desktop 1280px)
 * ┌──────────────────────────────┐  ┌─────────────┐
 * │  COMP. OVERVIEW   [58 %]    │  │  4 info     │
 * │  Company Name               │  │  cards      │
 * │  desc………………………………       │  │ (220px)     │
 * │  desc………………………………       │  └─────────────┘
 * │  desc………………………………       │
 * │  desc………………………………       │
 * │  desc………………………………       │
 * │  [Read More]                │
 * │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
 * │  [ tags ]  [ tags ]  ...    │
 * └──────────────────────────────┘
 */
function CompanyOverview({ companyName, description, ceo, headquarters, founded, marketCap, volume, industry, competitors }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wrapperRef = useRef(null);
  const textRef = useRef(null);

  const needsClamp = typeof description === "string" && description.length > 200;

  /**
   * Expand
   * ──────
   * 1. Clear stale inline height / max-height
   * 2. Set isExpanded = true (React un-clamps the paragraph)
   * 3. Three rAF ticks → browser paints three frames with unclamped text
   * 4. Measure text.scrollHeight (now = true full height)
   * 5. Apply it as inline max-height → CSS transition fires from collapsed px → full px
   * 6. transitionend listener → strip inline style; element stays at natural height
   */
  const expand = useCallback(() => {
    const w = wrapperRef.current;
    if (w) { w.style.maxHeight = ""; w.style.height = ""; }

    (function next(n) {
      if (n < 3) { queueMicrotask(() => requestAnimationFrame(() => next(n + 1))); return; }
      // Phase 3 — clamp is off, text is fully rendered
      if (w && textRef.current) {
        const full = textRef.current.scrollHeight;
        if (full > 40) {
          w.style.maxHeight = full + "px";
          w.addEventListener("transitionend", () => { w.style.maxHeight = ""; }, { once: true });
        }
      }
      setIsExpanded(true);
    })(0);
  }, [isExpanded]);

  /**
   * Collapse
   * ─────────
   * 1. Lock the current expanded offsetHeight as inline height (browser holds here)
   * 2. rAF → clamp is already live; measure clamped offsetHeight = clamp-border px
   * 3. Swap: inline height = clampHeight h  (clamp is obeying the old inline height at this moment)
   * 4. rAF → inline height falls back to 0 (or the clamp border height)
   * 5. Set max-height = clampHeight px + CSS transition → plays from expanded px → clamp px
   *
   * The result: browser first holds the show-less click at expanded height,
   * then smoothly transitions down to the clamp border height, then stays clamped.
   */
  const collapse = useCallback(() => {
    const w = wrapperRef.current;
    if (!w || !textRef.current) return;

    (function phase(p) {
      if (p === 0) {
        // Lock expanded height so the paragraph doesn't jump when clamp returns
        w.style.height = w.offsetHeight + "px";
        requestAnimationFrame(() => phase(1));
      } else if (p === 1) {
        // Clamp is live. Measure the true clamp-border height.
        const clampedH = Math.ceil(textRef.current.offsetHeight);
        const atNow    = w.offsetHeight;  // still the locked expanded value

        // Hold at expanded height for one more frame so the browser doesn't
        // immediately replace it with the smaller clamp border value
        w.style.transition = "height 0.38s ease, max-height 0.38s ease";
        w.style.maxHeight  = Math.max(atNow, clampedH + 8) + "px";

        requestAnimationFrame(() => {
          // Step 3: switch from long max-height → the actual clamp border height
          //          CSS transition plays: long maxHeight px  →  clampedH px
          w.style.height    = "";
          w.style.maxHeight = clampedH + "px";
          w.addEventListener(
            "transitionend",
            () => {
              w.style.transition = "";
              w.style.height     = "";
              w.style.maxHeight  = "";
              setIsExpanded(false);
            },
            { once: true }
          );
        });
      }
    })(0);
  }, []);

  const toggleExpand = isExpanded ? collapse : expand;

  /* ── Mount / new description ─────────────────────────────────────────── */
  useEffect(() => {
    if (isExpanded) return;
    const w = wrapperRef.current;
    const t = textRef.current;
    if (!w || !t) return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!isExpanded && t && w)
          w.style.maxHeight = t.scrollHeight + 4 + "px";
      })
    );
    return () => cancelAnimationFrame(raf);
  }, [description, isExpanded]);

  return (
    <section className="dashboard-card animate-fade-in overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col items-start lg:flex-row lg:gap-12">
        {/* ── LEFT ──────────────────────────────────────────────────────── */}
        <div className="flex w-full flex-col lg:max-w-[58%]">
          {/* Section kicker */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15">
              <Briefcase size={18} className="text-cyan-400" />
            </div>
            <p className="section-kicker mb-0">COMPANY OVERVIEW</p>
          </div>

          <h2 className="text-3xl font-black text-theme-text sm:text-4xl">
            {companyName || "Company"}
          </h2>

          {/* Description — 5-line clamp, animates on expand/collapse */}
          <div
            ref={wrapperRef}
            aria-expanded={isExpanded}
            style={{
              transition:       "max-height 0.38s ease",
              maxHeight:        isExpanded ? "2000px" : COLLAPSED_MAX_PX + "px",
              overflow:         "hidden",
            }}
          >
            <p
              ref={textRef}
              className="mt-4.5 max-w-[580px] text-base leading-[1.9] font-normal tracking-[0.2px]
                         text-[rgba(226,232,240,0.92)] dark:text-[rgba(226,232,240,0.92)]"
              style={{
                display:         isExpanded ? "block"       : "-webkit-box",
                WebkitLineClamp: isExpanded ? "unset"       : COLLAPSED_LINES,
                WebkitBoxOrient: isExpanded ? "horizontal"  : "vertical",
                overflow:        isExpanded ? "visible"     : "hidden",
                margin:          0,
                paddingTop:      0,
                paddingBottom:   0,
              }}
            >
              {description}
            </p>
          </div>

          {/* Read More / Show Less — left-aligned, directly below description */}
          {needsClamp && (
            <button
              onClick={toggleExpand}
              style={{ color: "#22d3ee", WebkitTextFillColor: "#22d3ee" }}
              className="mt-[12px] flex justify-start text-start text-[13px] font-semibold transition-all duration-200
                         hover:text-[#67e8f9] hover:decoration-[#67e8f9] hover:underline hover:decoration-[1.5px]
                         hover:underline-offset-[4px] decoration-transparent no-underline bg-transparent
                         border-0 outline-none cursor-pointer p-0"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}

          <div className="my-7 h-px bg-theme-border/40" />

          {/* Competitor section */}
          <p className="mt-[28px] mb-[14px] text-[13px] font-bold uppercase tracking-[1.5px] text-[#94A3B8]">
            Main Competitors
          </p>
          <div className="flex flex-wrap gap-2">
            {(competitors || []).map((comp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full border border-cyan-500/18 bg-cyan-500/9
                           px-3.5 py-1.5 text-[11px] font-semibold text-cyan-200/80 backdrop-blur-sm
                           transition-colors duration-200 hover:border-cyan-500/30 hover:text-cyan-100"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT — Info Cards ─────────────────────────────────────────── */}
        {/* self-start + items-start on the outer flex row keep right cards
            at their natural height throughout — they NEVER stretch.         */}
        <div className="mt-10 flex w-full justify-end self-start lg:mt-0">
          <div className="grid grid-cols-2 gap-4 lg:min-w-[340px] lg:pl-8">
            {industry && (
              <InfoCard icon={Building2} label="Industry" value={industry} />
            )}
            {ceo && ceo !== "N/A" && (
              <InfoCard icon={User} label="CEO" value={ceo} />
            )}
            {headquarters && headquarters !== "N/A" && (
              <InfoCard icon={MapPin} label="Headquarters" value={headquarters} />
            )}
            <InfoCard
              icon={Calendar}
              label="Founded"
              value={founded && founded !== "Not Available" ? founded : "Not Available"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   InfoCard
   Fixed compact layout.
   ══════════════════════════════════════════════════════════════════════════ */
function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="info-grid-card group flex items-start gap-3 p-[18px] min-h-[110px]
                    backdrop-blur-[14px] self-start">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                      bg-[rgba(59,130,246,0.10)] ring-1 ring-[rgba(59,130,246,0.14)]
                      transition-all duration-300
                      group-hover:bg-[rgba(59,130,246,0.18)] group-hover:ring-[rgba(59,130,246,0.28)]">
        <Icon size={13} className="text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-theme-muted">
          {label}
        </p>
        <p className="mt-1.5 truncate text-lg leading-tight font-bold text-theme-text">
          {value}
        </p>
      </div>
    </div>
  );
}

export default CompanyOverview;
