import { Outlet, Navigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import Sidebar from "../components/Sidebar";
import axiosClient from "../api/axios"; // Import de l'instance axios
import { 
  ClipboardList, CheckCircle2, FileStack, Users2, 
  Loader2, LayoutGrid, Bell, LogOut,
  Settings, ChevronRight, Fingerprint
} from "lucide-react";

export default function ChefDivisionLayout() {
  const { user, token, setUser, setToken } = useStateContext();


  if (!token) return <Navigate to="/login" />;
  if (user.roles[0] !== "ChefDivision") return <Navigate to="/unauthorized" replace />;

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initialisation Manager...</p>
      </div>
    );
  }




  const onLogout = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/logout');
      setUser(null);
      setToken(null);
    } catch (err) {
      // En cas d'erreur, on force quand même le nettoyage local
      setUser(null);
      setToken(null);
    }
  };

  const links = [
    { label: "Vue d'ensemble", path: "/division/dashboard", icon: <LayoutGrid size={20} /> },
    { label: "Propositions", path: "/division/propositions", icon: <ClipboardList size={20} /> },
    { label: "Suivi Bilans", path: "/division/suivi-bilans", icon: <CheckCircle2 size={20} /> },
    { label: "Rapports Division", path: "/division/rapport-division", icon: <FileStack size={20} /> },
    { label: "Équipe & Projets", path: "/division/membres-structures", icon: <Users2 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      
      <Sidebar 
        title="Management" 
        subtitle="Division Panel"
        links={links} 
        colorClass="bg-slate-950" 
        accentColor="emerald"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-40">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <Fingerprint size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                Espace Structure
              </h2>
              {user.division && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 italic uppercase">
                      Division {user.division.acronyme}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                    <Bell size={20} />
                </button>
                {/* BOUTON LOGOUT INTÉGRÉ ICI */}
                <button 
                  onClick={onLogout}
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                  title="Déconnexion"
                >
                    <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-black text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">
                    {user.nom} {user.prenom}
                </p>
                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-1.5 italic">
                    Chef de Division
                </p>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-100 border-2 border-white ring-1 ring-emerald-50">
                    {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
          <div className="max-w-7xl mx-auto py-10 px-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
                <span>Manager</span>
                <ChevronRight size={10} />
                <span className="text-emerald-600">Division Panel</span>
            </div>

            <Outlet />
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}} />
    </div>
  );
}