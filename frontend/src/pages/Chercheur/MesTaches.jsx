import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios";
import { 
  CheckCircle2, Clock, AlertCircle, 
  Calendar, ArrowRight, Loader2, Filter,
  LayoutGrid, List
} from "lucide-react";

export default function MesTaches() {
  const navigate = useNavigate();
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("toutes");

  useEffect(() => {
    fetchTaches();
  }, []);

  const fetchTaches = async () => {
    try {
      const { data } = await axiosClient.get("/mes-taches");
      setTaches(data);
    } catch (err) {
      console.error("Erreur chargement tâches", err);
    } finally {
      setLoading(false);
    }
  };

  // Logique de filtrage
  const filteredTaches = taches.filter(t => 
    filter === "toutes" ? true : t.etat === filter
  );

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- EN-TÊTE & FILTRES --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Missions</h1>
          <p className="text-slate-500 text-sm font-medium">Gérez vos responsabilités sur l'ensemble des projets actifs.</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          {["toutes", "A faire", "En cours", "Terminé"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                : "text-slate-400 hover:text-indigo-600"
              }`}
            >
              {f === "toutes" ? "Toutes" : f}
            </button>
          ))}
        </div>
      </div>

      {/* --- STATISTIQUES RAPIDES --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total</p>
          <p className="text-2xl font-black text-slate-900">{taches.length}</p>
        </div>
        <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-600 uppercase mb-1">En cours</p>
          <p className="text-2xl font-black text-amber-600">{taches.filter(t => t.etat === 'En cours').length}</p>
        </div>
        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Terminées</p>
          <p className="text-2xl font-black text-emerald-600">{taches.filter(t => t.etat === 'Terminé').length}</p>
        </div>
        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">À faire</p>
          <p className="text-2xl font-black text-indigo-600">{taches.filter(t => t.etat === 'A faire').length}</p>
        </div>
      </div>

      {/* --- LISTE DES TÂCHES --- */}
      <div className="space-y-4">
        {filteredTaches.length > 0 ? filteredTaches.map((tache) => (
          <div 
            key={tache.id} 
            onClick={() => navigate(`/chercheur/taches/${tache.id}`)}
            className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all flex flex-col md:flex-row items-center gap-6 cursor-pointer"
          >
            
            {/* Icône de Statut */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              tache.etat === 'Terminé' ? 'bg-emerald-50 text-emerald-500' : 
              tache.etat === 'En cours' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400'
            }`}>
              {tache.etat === 'Terminé' ? <CheckCircle2 size={28}/> : <Clock size={28}/>}
            </div>

            {/* Détails de la Tâche */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">
                  {tache.work_package?.projet?.titre || "Projet"}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-md">
                  {tache.work_package?.code_wp}
                </span>
              </div>
              
              <h3 className="font-black text-slate-800 text-xl leading-tight group-hover:text-indigo-600 transition-colors">
                {tache.nom}
              </h3>

              <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-300"/> 
                  Échéance : {new Date(tache.date_fin).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Badge de Statut & Action */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                tache.etat === 'Terminé' ? 'bg-emerald-100 text-emerald-700' : 
                tache.etat === 'En cours' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {tache.etat}
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight size={20} />
              </div>
            </div>

          </div>
        )) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <AlertCircle className="mx-auto text-slate-200 mb-4" size={50} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucune tâche trouvée pour ce filtre</p>
          </div>
        )}
      </div>

    </div>
  );
}