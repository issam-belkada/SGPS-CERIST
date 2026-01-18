import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import Sidebar from "../components/Sidebar";
import { 
  FolderRoot, CheckSquare, Send, Users2, 
  Loader2, Bell, LayoutDashboard, Search 
} from "lucide-react";

export default function ChercheurLayout() {
  const { user, token } = useStateContext();
  const location = useLocation();

  // 1. Protection : Si pas de token, redirection login
  if (!token) return <Navigate to="/login" />;

  // 2. Sécurité : Attendre que l'objet user soit chargé
  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Chargement du profil...</p>
      </div>
    );
  }

  // 3. Autorisation : Accès permis aux chercheurs et chefs de projet
  const allowedRoles = ["Chercheur", "ChefProjet"];
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  const chercheurLinks = [
    { label: "Dashboard", path: "/chercheur/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Mes Projets", path: "/chercheur/mes-projets", icon: <FolderRoot size={18} /> },
    { label: "Mes Tâches", path: "/chercheur/mes-taches", icon: <CheckSquare size={18} /> },
    { label: "Proposer Projet", path: "/chercheur/proposer-projet", icon: <Send size={18} /> },
    { label: "Ma Division", path: "/chercheur/ma-division", icon: <Users2 size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#FDFDFD]">
      {/* Sidebar - Couleur Slate-900 pour un look pro */}
      <Sidebar 
        title="CERIST Research" 
        links={chercheurLinks} 
        colorClass="bg-slate-900" 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Moderne */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 z-10">
          
          {/* Fil d'ariane / Titre dynamique */}
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Portail Chercheur
             </span>
             <h2 className="text-sm font-black text-slate-800">
                {chercheurLinks.find(l => l.path === location.pathname)?.label || "Espace Travail"}
             </h2>
          </div>

          {/* Actions Droite */}
          <div className="flex items-center gap-6">
            {/* Barre de recherche discrète */}
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
               <Search size={16} className="text-slate-400" />
               <input type="text" placeholder="Rechercher..." className="bg-transparent border-none text-xs focus:outline-none px-2 w-40" />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-100"></div>

            {/* Profil */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none">
                  {user.nom} {user.prenom}
                </p>
                <p className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-tighter">
                  {user.division?.acronyme || "CERIST"} • {user.role}
                </p>
              </div>
              
              <div className="relative group cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
                  {user.nom?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal avec scroll fluide */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#FBFCFE]">
          <div className="max-w-6xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}