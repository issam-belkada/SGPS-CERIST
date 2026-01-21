import { Link, useLocation } from "react-router-dom";
import logoCerist from "../assets/logo.png";

export default function Sidebar({ title, links }) {
  const location = useLocation();

  return (
    <div className="w-72 h-screen bg-slate-950 text-white flex flex-col shrink-0 p-4 border-r border-slate-900 shadow-2xl">
      
      {/* HEADER : Logo & Branding */}
      <div className="px-4 py-8 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-2.5 shadow-lg ring-1 ring-white/10">
            <img src={logoCerist} alt="CERIST" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight leading-none">{title}</span>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1.5">Management</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION : Style Pill Moderne */}
      <nav className="flex-1 space-y-1.5 px-2">
        {links.map((link, index) => {
          const isActive = location.pathname.includes(link.path);
          return (
            <Link
              key={index}
              to={link.path}
              className={`
                group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300
                ${isActive 
                  ? "bg-indigo-600/10 text-white border border-indigo-500/20" 
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}
              `}
            >
              <div className={`${isActive ? "text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "text-slate-500 group-hover:text-slate-300"} transition-all duration-300`}>
                {link.icon}
              </div>
              <span className={`text-[13px] font-bold tracking-tight ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                {link.label}
              </span>
              
              {isActive && (
                <div className="ml-auto w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,1)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER : Version du système */}
      <div className="mt-auto p-4 bg-slate-900/40 rounded-2xl border border-white/5 mx-2 mb-2">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Système Actif</span>
              <span className="text-[9px] font-medium text-slate-500">v2.0.4 - SGPR-CERIST</span>
           </div>
        </div>
      </div>
    </div>
  );
}