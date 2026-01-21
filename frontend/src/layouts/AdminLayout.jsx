import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../api/axios";
import logoCerist from "../assets/logo.png";
import { 
  Users, Building2, ShieldCheck, LayoutDashboard, 
  LogOut, Bell, Search, Menu, X, ChevronRight 
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const { user, token, setUser, setToken } = useStateContext();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  if (!token) return <Navigate to="/login" replace />;
  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-white font-black text-slate-400 uppercase tracking-widest text-xs">
      Chargement du système...
    </div>
  );

  const onLogout = (e) => {
    e.preventDefault();
    axiosClient.post("/logout").then(() => {
      setUser(null);
      setToken(null);
      navigate("/login");
    });
  };

  const navLinks = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Utilisateurs", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Divisions", path: "/admin/divisions", icon: <Building2 size={20} /> },
    { label: "Logs Système", path: "/admin/logs", icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      
      {/* SIDEBAR : Style identique au Chercheur (Sombre & Premium) */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-950 text-white transition-all duration-300 flex flex-col z-50 shadow-2xl`}>
        
        {/* LOGO SECTION : Logo sur fond blanc pour le contraste */}
        <div className="h-24 flex items-center px-6 gap-4 border-b border-white/5">
          <div className="shrink-0 w-12 h-12 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/10">
             <img src={logoCerist} alt="CERIST" className="w-full h-full object-contain" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="font-black tracking-tighter text-lg leading-none italic">SGPR <span className="text-blue-500">ADMIN</span></span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5">Management</span>
            </div>
          )}
        </div>

        {/* NAVIGATION : Style Pill avec Glow Indigo */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 border border-transparent
                ${isActive 
                  ? 'bg-blue-600/10 text-white border-blue-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`shrink-0 transition-all duration-300 ${isActive ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:text-slate-200'}`}>
                    {link.icon}
                  </span>
                  {isSidebarOpen && (
                    <span className={`font-bold text-[13px] tracking-tight ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {link.label}
                    </span>
                  )}
                  {isActive && isSidebarOpen && (
                    <div className="ml-auto w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,1)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER : Minimaliste & Glassmorphism */}
        <header className="h-20 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors shadow-sm"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher dans le système..." 
                className="pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] w-80 focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-11 h-11 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-2xl shadow-sm transition-all group">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            {/* ADMIN PROFILE */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-black text-slate-900 leading-none">{user.nom} {user.prenom}</p>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1.5 italic">Administrateur</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 flex items-center justify-center text-white font-black text-xs shadow-xl border-2 border-white ring-1 ring-slate-100 uppercase">
                {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
          <div className="max-w-7xl mx-auto py-10 px-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Styles de scrollbar personnalisés */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}} />
    </div>
  );
}