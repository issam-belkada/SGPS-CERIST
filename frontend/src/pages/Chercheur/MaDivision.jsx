import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";
import { 
  Users2, Globe, Mail, MapPin, Target, 
  ShieldCheck, Loader2, Sparkles, Fingerprint,
  ArrowUpRight, MailQuestion
} from "lucide-react";

export default function MaDivision() {
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDivisionData = async () => {
      try {
        const { data } = await axiosClient.get("/mon-entite-division");
        setDivision(data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchDivisionData();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Division Data...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HERO SECTION : BENTO STYLE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 relative overflow-hidden bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/10">
          {/* Décoration de fond (Gradient Glow) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <Fingerprint size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 italic">Identité Divisionnaire</span>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic">
                  {division?.acronyme} <span className="text-indigo-500">.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 font-bold tracking-tight max-w-2xl leading-snug">
                  {division?.nom}
                </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
               <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                  <Globe size={14} className="text-indigo-500" /> CERIST Algiers
               </div>
               <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                  <Target size={14} className="text-indigo-500" /> {division?.users?.length} Experts
               </div>
            </div>
          </div>
        </div>

        {/* --- CARTE CHEF (BENTO SIDE) --- */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-all">
            <div className="relative mb-4">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-100 group-hover:scale-105 transition-transform duration-500">
                    {division?.chef?.nom?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-slate-50">
                    <ShieldCheck size={16} className="text-indigo-600" />
                </div>
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate w-full">
              {division?.chef?.nom} {division?.chef?.prenom}
            </h3>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Chef de Division</p>
            <a 
      href={`mailto:${division?.chef?.email}`} 
      className="mt-6 w-full py-3.5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 shadow-lg shadow-slate-200 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
    >
      Contact <ArrowUpRight size={14} className="opacity-50" />
    </a>
        </div>
      </div>

      {/* --- SECTION BASSE : MEMBRES & FOCUS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LISTE DES MEMBRES (COL 8) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Users2 size={24} className="text-indigo-600" /> 
                Membres de l'unité
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Équipe de recherche active</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {division?.users?.map((membre) => (
              <div key={membre.id} className="p-5 bg-[#F8FAFC] rounded-[1.8rem] flex items-center gap-4 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-sm text-slate-900 border border-slate-100 shadow-sm group-hover:bg-slate-950 group-hover:text-white transition-colors">
                  {membre.nom?.charAt(0)}{membre.prenom?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-[13px] leading-none truncate uppercase tracking-tight">
                      {membre.nom} {membre.prenom}
                  </h4>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase mt-2 tracking-wider">
                      {membre.grade || "Chercheur Principal"}
                  </p>
                </div>
                <a href={`mailto:${membre.email}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                  <Mail size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* INFOS COMPLEMENTAIRES (COL 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <Sparkles className="absolute top-4 right-4 text-white/20 group-hover:rotate-12 transition-transform" size={40} />
            <h3 className="text-lg font-black tracking-tight mb-4">Axes de Recherche</h3>
            <div className="space-y-3">
               {["Innovation Numérique", "Data Science", "Infrastructure IT", "Sécurité"].map((axe, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                      <span className="text-[11px] font-black uppercase tracking-widest">{axe}</span>
                  </div>
               ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
               <MapPin size={16} className="text-indigo-600"/> Localisation
            </h3>
            <div className="space-y-4">
               <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Building2 size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    Centre de Recherche sur l'Information Scientifique et Technique (CERIST), Ben Aknoun, Alger.
                  </p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Composant icône manquant dans les imports
function Building2(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  );
}