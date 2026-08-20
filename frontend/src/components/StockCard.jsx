import React from "react";

function StockCard({
  icon: Icon,
  tone = "cyan",
  title,
  value,
  subtitle,
  isPrediction = false,
  confidence,
}) {
  const colorMap = {
    cyan: "text-cyan-400",
    green: "text-emerald-400",
    red: "text-rose-400",
    amber: "text-amber-400",
    violet: "text-violet-400",
    slate: "text-theme-muted",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
  };

  const glowMap = {
    cyan: "from-cyan-400/18 to-blue-600/[0.08] shadow-cyan-500/12",
    green: "from-emerald-400/18 to-green-600/[0.08] shadow-emerald-500/12",
    red: "from-rose-400/18 to-red-600/[0.08] shadow-rose-500/12",
    amber: "from-yellow-400/18 to-amber-600/[0.08] shadow-yellow-500/12",
    violet: "from-violet-400/18 to-indigo-600/[0.08] shadow-violet-500/12",
    slate: "from-slate-400/10 to-slate-600/[0.05] shadow-slate-500/[0.05]",
    yellow: "from-yellow-400/18 to-amber-600/[0.08] shadow-yellow-500/12",
    blue: "from-blue-400/14 to-indigo-600/[0.06] shadow-blue-500/12",
  };

  const accentClasses = {
    cyan: "bg-gradient-to-r from-cyan-400/30 via-sky-400/20 to-blue-500/30",
    blue: "bg-gradient-to-r from-blue-400/30 via-indigo-400/20 to-violet-500/30",
    green: "bg-gradient-to-r from-emerald-400/30 via-lime-400/20 to-emerald-500/30",
    red: "bg-gradient-to-r from-rose-400/30 via-red-400/20 to-rose-500/30",
    amber: "bg-gradient-to-r from-amber-400/30 via-yellow-400/20 to-orange-400/30",
    violet: "bg-gradient-to-r from-violet-400/30 via-fuchsia-400/20 to-purple-500/30",
    slate: "bg-gradient-to-r from-slate-400/30 via-slate-500/20 to-slate-600/30",
    yellow: "bg-gradient-to-r from-amber-400/30 via-yellow-300/20 to-amber-500/30",
  };

  return (
    <article
      className={`matrix-card group relative flex h-[190px] w-full flex-col gap-3 overflow-hidden p-6 transition-all duration-300 ${isPrediction ? "hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(6,182,212,0.18)]" : "hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(6,182,212,0.12)]"}`}
    >
      {isPrediction && Icon && (
        <div className="absolute top-5 right-5 z-20">
          <div className={`w-12 h-12 rounded-2xl card-icon-button tone-${tone} bg-[#0b1635]/80 border border-cyan-500/10 flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.08)]`}>
            <Icon className={`w-5 h-5 ${colorMap[tone] || colorMap.cyan}`} />
          </div>
        </div>
      )}
      {Icon && !isPrediction && (
        <div className="absolute top-5 right-5 z-20">
          <div className={`w-12 h-12 rounded-2xl card-icon-button tone-${tone} bg-[#08142d] border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.08)]`}>
            <Icon className={`w-5 h-5 ${colorMap[tone] || colorMap.cyan}`} />
          </div>
        </div>
      )}

      {isPrediction ? (
        <div className="relative z-10 flex h-full flex-col">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.2em] text-slate-400 uppercase">{title}</p>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-theme-text leading-none">{value}</h2>
            {typeof confidence !== "undefined" && confidence !== null && (
              <p className="text-sm font-semibold text-cyan-300 mb-1">Confidence: {confidence}%</p>
            )}
          </div>

          <div className="flex-1" />

          <div className="pt-4">
            <div className={`card-accent-line accent-${tone} h-[2px] w-full rounded-full ${accentClasses[tone] || 'bg-cyan-500/50'}`} />
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-full flex-col">
          <div>
            <p className="truncate text-[12px] font-bold uppercase tracking-[1.4px] text-theme-muted">{title}</p>
            {subtitle && <p className="mt-2 max-w-[80%] text-xs text-theme-muted">{subtitle}</p>}
          </div>

          <div className="mt-4">
            <h2 className="text-3xl font-bold tracking-tight text-theme-text leading-none">{value}</h2>
          </div>

          <div className="flex-1" />

          <div className="pt-4">
            <div className={`card-accent-line accent-${tone} h-[2px] w-full rounded-full ${accentClasses[tone] || accentClasses.cyan}`} />
          </div>
        </div>
      )}

      
    </article>
  );
}

export default StockCard;
