import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axios";
import { useStateContext } from "../../context/ContextProvider";
import { 
  FolderRoot, Search, Plus, 
  Calendar, ArrowUpRight, Loader2,
  User, Users, Briefcase
} from "lucide-react";

export default function MesProjets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("chef"); // 'chef' ou 'participant'
  const { user } = useStateContext();

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    try {
      const { data } = await axiosClient.get("/mes-projets");
      setProjets(data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Filtrage par recherche
  const filteredProjets = projets.filter(p => 
    p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.acronyme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Séparation des deux listes
  const mesProjetsEnTantQueChef = filteredProjets.filter(p => p.chef_projet_id === user.id);
  const mesProjetsEnTantQueParticipant = filteredProjets.filter(p => p.chef_projet_id !== user.id);

  // Choisir quelle liste afficher selon l'onglet actif
  const projetsAAfficher = activeTab === "chef" ? mesProjetsEnTantQueChef : mesProjetsEnTantQueParticipant;

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portefeuille Projets</h1>
          <p className="text-slate-500 font-medium">Gérez vos responsabilités et contributions au CERIST.</p>
        </div>
        <Link 
          to="/chercheur/proposer-projet" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={16} /> Soumettre une idée
        </Link>
      </div>

      {/* BARRE DE RECHERCHE ET ONGLETS */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher dans mes projets..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* SYSTÈME D'ONGLETS (TABS) */}
        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("chef")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
              activeTab === "chef" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Briefcase size={14} /> Chef de Projet ({mesProjetsEnTantQueChef.length})
          </button>
          <button
            onClick={() => setActiveTab("participant")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
              activeTab === "participant" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users size={14} /> Participant ({mesProjetsEnTantQueParticipant.length})
          </button>
        </div>
      </div>

      {/* GRILLE DE PROJETS */}
      {projetsAAfficher.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projetsAAfficher.map((projet) => (
            <ProjectCard key={projet.id} projet={projet} isChef={projet.chef_projet_id === user.id} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <FolderRoot size={32} />
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Aucun projet trouvé dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}

// Sous-composant pour la carte projet pour plus de lisibilité
function ProjectCard({ projet, isChef }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full border-b-4 border-b-transparent hover:border-b-indigo-500">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          <FolderRoot size={24} />
        </div>
        
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
          isChef 
          ? 'bg-amber-100 text-amber-700 border border-amber-200' 
          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
        }`}>
          {isChef ? <User size={10} /> : <Users size={10} />}
          {isChef ? 'Responsable' : 'Contributeur'}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-black text-slate-800 text-lg leading-tight mb-2 uppercase line-clamp-2">{projet.titre}</h3>
        <span className="text-indigo-600 text-[11px] font-black tracking-[0.2em]">{projet.acronyme}</span>
        
        <div className="mt-4 flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase">
           <div className="flex items-center gap-1">
              <Calendar size={12} /> {new Date(projet.date_debut).getFullYear()}
           </div>
           <div className="flex items-center gap-1">
              <Users size={12} /> {projet.membres_count} membres
           </div>
        </div>

        
        
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50">
        <Link 
          to={`/chercheur/projet/${projet.id}`}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl hover:bg-indigo-600 transition-all text-[10px] font-black uppercase tracking-widest"
        >
          Ouvrir l'espace projet <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}