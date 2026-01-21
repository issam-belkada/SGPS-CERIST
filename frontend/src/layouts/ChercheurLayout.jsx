import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import Sidebar from "../components/Sidebar";
import { 
  FolderRoot, CheckSquare, Send, Users2, 
  Loader2, Bell, LayoutDashboard, Search,
  LogOut, UserCircle, ChevronDown
} from "lucide-react";

export default function ChercheurLayout() {
  const { user, token, setUser, setToken } = useStateContext();
  const location = useLocation();

  if (!token) return <Navigate to="/login" />;

  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Initialisation...</p>
      </div>
    );
  }

  const logout = (e) => {
    e.preventDefault();
    setUser({});
    setToken(null);
  };

  const chercheurLinks = [
    { label: "Dashboard", path: "/chercheur/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Mes Projets", path: "/chercheur/mes-projets", icon: <FolderRoot size={18} /> },
    { label: "Mes Tâches", path: "/chercheur/mes-taches", icon: <CheckSquare size={18} /> },
    { label: "Proposer Projet", path: "/chercheur/proposer-projet", icon: <Send size={18} /> },
    { label: "Ma Division", path: "/chercheur/ma-division", icon: <Users2 size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar title="SGPR-CERIST" links={chercheurLinks} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER : Minimaliste & Action-Oriented */}
        <header className="h-20 flex items-center justify-between px-10 shrink-0">
          
          {/* Titre de la page dynamique */}
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
                Portail Chercheur
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                 {chercheurLinks.find(l => location.pathname.includes(l.path))?.label || "Consultation"}
              </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Barre de recherche */}
            <div className="hidden lg:flex items-center bg-white shadow-sm border border-slate-200 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Search size={14} className="text-slate-400" />
                <input type="text" placeholder="Recherche rapide..." className="bg-transparent border-none text-[11px] focus:outline-none px-3 w-48 font-semibold" />
            </div>

            {/* Notifications */}
            <button className="relative w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all group">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            {/* Profil Utilisateur Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-3 p-1 pr-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white text-[10px]">
                  {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                </div>
                <div className="text-left hidden xl:block">
                   <p className="text-[11px] font-black text-slate-900 leading-none">{user.nom} {user.prenom}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{user.division?.acronyme || "CERIST"}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 translate-y-2 group-hover:translate-y-0">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <UserCircle size={16} /> Profil
                  </button>
                  <div className="h-px bg-slate-50 my-1"></div>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <LogOut size={16} /> Déconnexion
                  </button>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
           <Outlet context={{ user }} />
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}} />
    </div>
  );
}