import { useState, useEffect } from "react";
import axiosClient from "../../api/axios";
import { 
  FileText, Calendar, User, ArrowUpRight, 
  CheckCircle, XCircle, MessageSquare, Clock,
  Filter, Search, ChevronRight, LayoutList
} from "lucide-react";

export default function Propositions() {
  const [propositions, setPropositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, validated

  useEffect(() => {
    // Simulation d'appel API
    const fetchPropositions = async () => {
      try {
        const { data } = await axiosClient.get("/division/propositions");
        setPropositions(data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchPropositions();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER DE PAGE --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
            Propositions <span className="text-emerald-500">Projets</span>
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">
            File d'attente des validations de la division
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {['all', 'pending', 'validated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'Tout' : f === 'pending' ? 'En attente' : 'Validés'}
            </button>
          ))}
        </div>
      </div>

      {/* --- STATS RAPIDES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <CheckCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">À Valider</p>
          <h3 className="text-4xl font-black mt-2">08</h3>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Taux d'approbation</p>
          <h3 className="text-4xl font-black text-slate-900 mt-2">92<span className="text-emerald-500">%</span></h3>
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Délai moyen</p>
          <h3 className="text-4xl font-black mt-2">48<span className="text-emerald-400 text-xl font-bold ml-1">h</span></h3>
        </div>
      </div>

      {/* --- LISTE DES PROPOSITIONS --- */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center"><Clock className="animate-spin text-emerald-500" /></div>
        ) : (
          propositions.map((prop) => (
            <div key={prop.id} className="group bg-white rounded-[2.5rem] border border-slate-200 p-2 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6">
                
                {/* Icône & Statut */}
                <div className="w-16 h-16 shrink-0 bg-[#F8FAFC] rounded-3xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <FileText size={28} />
                </div>

                {/* Contenu */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                      {prop.type || "Nouveau Projet"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Reçu il y a 2 jours
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors leading-snug">
                    {prop.titre}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                        {prop.chercheur?.nom?.charAt(0)}
                      </div>
                      <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tighter">
                        {prop.chercheur?.nom} {prop.chercheur?.prenom}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Bento */}
                <div className="flex items-center gap-3 lg:pl-6 lg:border-l border-slate-100">
                  <button className="h-14 px-6 bg-[#F8FAFC] text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all flex items-center gap-2 group/btn">
                    <MessageSquare size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Feedback</span>
                  </button>
                  
                  <button className="h-14 px-8 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:shadow-emerald-200 transition-all flex items-center gap-2">
                    Approuver <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}