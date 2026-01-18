import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";
import { 
  FolderRoot, Calendar, Users, ArrowUpRight, 
  Search, Filter, Plus, Loader2, MoreVertical
} from "lucide-react";

export default function MesProjets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation d'appel API - À remplacer par axiosClient.get('/chercheur/projets')
    setTimeout(() => {
      setProjets([
        { id: 1, titre: "Intelligence Artificielle pour la Santé", code: "PRFU2024", statut: "En cours", membres: 4, date_fin: "2025-12-10", progres: 65 },
        { id: 2, titre: "Optimisation des réseaux 5G", code: "PNR-05", statut: "Validé", membres: 3, date_fin: "2024-06-15", progres: 100 },
        { id: 3, titre: "Analyse Big Data - Climat", code: "CERS-22", statut: "En attente", membres: 2, date_fin: "2026-01-01", progres: 10 }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Chargement de vos projets...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Mes Projets de Recherche</h1>
          <p className="text-slate-500 text-sm">Vous avez {projets.length} projets actifs cette année.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 text-sm">
          <Plus size={18} /> Proposer un nouveau projet
        </button>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un projet par titre ou code..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-sm"
          />
        </div>
        <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Grille de Projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projets.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:shadow-xl hover:shadow-slate-100 transition-all group relative overflow-hidden">
            
            {/* Décoration subtile selon le statut */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 ${
              p.statut === "En cours" ? "bg-indigo-600" : p.statut === "Validé" ? "bg-emerald-600" : "bg-amber-600"
            }`}></div>

            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FolderRoot size={24} />
              </div>
              <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={20} /></button>
            </div>

            <div className="mb-6">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{p.code}</span>
              <h3 className="font-black text-slate-800 text-lg leading-tight mt-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {p.titre}
              </h3>
            </div>

            {/* Barre de progression */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                <span>Avancement</span>
                <span className="text-slate-700">{p.progres}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    p.statut === "En cours" ? "bg-indigo-500" : p.statut === "Validé" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${p.progres}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-slate-500">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Users size={16} className="text-slate-400" />
                {p.membres} membres
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Calendar size={16} className="text-slate-400" />
                {new Date(p.date_fin).getFullYear()}
              </div>
            </div>

            <button className="mt-6 w-full py-3 bg-slate-50 rounded-2xl text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
              Détails du projet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}