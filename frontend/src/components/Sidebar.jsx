import React from "react";
import { BarChart3, BriefcaseBusiness, CircleHelp, Eye, LogOut, Newspaper, Search, TrendingUp } from "lucide-react";

const navItems = [
  { id: "search", label: "Discover", icon: Search },
  { id: "news", label: "Market News", icon: Newspaper },
  { id: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { id: "watchlist", label: "Watchlist", icon: Eye },
  { id: "about", label: "About", icon: CircleHelp },
];

function Sidebar({ activePage, onLogout, onNavigate }) {
  return (
    <aside className="p-3 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-[250px]">
      <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-cyan-500/10 bg-[#071226]/95 backdrop-blur-xl shadow-xl shadow-black/35">
        <div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300/15">
              <BarChart3 size={19} strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black tracking-tight text-white">InvestBuddy</p>
              <p className="text-[11px] font-medium leading-4 text-slate-400">Premium market OS</p>
            </div>
          </div>

          <div className="mx-3 mb-3 rounded-2xl border border-cyan-400/10 bg-cyan-500/5 px-3.5 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-300">
              <TrendingUp size={12} strokeWidth={2} />
              Live desk
            </div>
            <p className="text-[11px] leading-5 text-slate-400">
              Track equities, news, watchlists, and allocation ideas from one clean workspace.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-1.5 px-3 pb-3 lg:grid-cols-1">
            {navItems.map((item) => (
              <SidebarItem
                active={activePage === item.id}
                item={item}
                key={item.id}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </nav>
        </div>

        <div className="p-3">
          <button
            className="sidebar-logout-btn flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all duration-300"
            onClick={onLogout}
            type="button"
          >
            <LogOut size={15} strokeWidth={2} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ active, item, onClick }) {
  const Icon = item.icon;

  return (
    <button
      className={`group relative flex h-11 items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-left text-sm font-bold transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
          : "text-slate-400 hover:translate-x-0.5 hover:bg-white/5 hover:text-white hover:shadow-md hover:shadow-cyan-500/10"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className={active ? "text-white" : "text-slate-400 group-hover:text-white"} size={15} strokeWidth={active ? 2.1 : 1.9} />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export default Sidebar;
