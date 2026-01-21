import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios";
import { 
  FolderKanban, FileCheck, Info, Calendar, CheckCircle2, 
  Clock, FileText, User as UserIcon, AlertCircle, 
  Loader2, Lock, Download, ArrowRight,
  Users, PlusCircle, ShieldCheck, History
} from "lucide-react";

// Import des modales
import WorkPackageModal from "./WorkPackageModal";
import TacheModal from "./TacheModal";
import ManageTeamModal from "./ManageTeamModal";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // États pour les modales
  const [showWPModal, setShowWPModal] = useState(false);
  const [showTacheModal, setShowTacheModal] = useState(null); 
  const [showTeamModal, setShowTeamModal] = useState(false);

  const userString = localStorage.getItem('user') || localStorage.getItem('USER');
  const user = userString ? JSON.parse(userString) : null;
  const myId = user?.id;

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/projet-details/${id}`);
      setProjet(data);
    } catch (err) {
      console.error("Erreur projet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  // --- LOGIQUE DE ROLE ET PROGRESSION ---
  const isChefDeProjet = Number(myId) === Number(projet?.chef_projet_id);
  
  const allTaches = projet?.work_packages?.flatMap(wp => wp.taches) || [];
  const totalTaches = allTaches.length;
  const tachesTerminees = allTaches.filter(t => t.etat === 'Terminé').length;
  const progression = totalTaches > 0 ? Math.round((tachesTerminees / totalTaches) * 100) : 0;

  const handleDownload = async (livrable) => {
    try {
      const response = await axiosClient.get(`/livrables/${livrable.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${livrable.titre}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors du téléchargement.");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="mt-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Initialisation du projet...</p>
    </div>
  );

  if (!projet) return (
    <div className="p-10 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <p>Projet introuvable.</p>
    </div>
  );

  const livrablesRemplis = (projet.all_livrables || []).filter(l => l.fichier_path !== 'waiting_upload');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER AVEC ACTIONS */}
      <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap justify-between items-start gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                  {projet.type}
                </span>
                <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${
                  projet.statut === 'enCours' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {projet.statut}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{projet.titre}</h1>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 w-full lg:w-auto">
                {/* Bloc Progression */}
                <div className="min-w-[250px] bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Avancement</p>
                        <p className="text-sm font-black text-indigo-600">{progression}%</p>
                    </div>
                    <div className="h-2.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                             style={{ width: `${progression}%` }}></div>
                    </div>
                </div>

                {/* Actions du Chef de Projet */}
                {isChefDeProjet && (
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => navigate(`/chercheur/projets/${id}/bilans-liste`)}
                            className="px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase"
                        >
                            <History size={16}/> Historique Bilans
                        </button>

                        <button 
                            onClick={() => navigate(`/chercheur/projets/${id}/bilan`)}
                            className="px-4 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase"
                        >
                            <FileText size={16}/> Nouveau Bilan
                        </button>

                        <button 
                            onClick={() => setShowWPModal(true)}
                            className="col-span-2 px-4 py-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase"
                        >
                            <PlusCircle size={16}/> Nouveau Work Package
                        </button>
                    </div>
                )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 mt-10 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><Calendar size={18} /></div>
                <div><p className="text-[8px] font-black text-slate-400 uppercase">Démarrage</p><p className="text-xs font-bold text-slate-700">{new Date(projet.date_debut).toLocaleDateString()}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><UserIcon size={18} /></div>
                <div><p className="text-[8px] font-black text-slate-400 uppercase">Responsable Projet</p><p className="text-xs font-bold text-slate-700">{projet.chef_projet?.nom} {projet.chef_projet?.prenom}</p></div>
              </div>
          </div>
        </div>

        {/* ONGLETS NAVIGATION */}
        <div className="flex gap-10 mt-12 overflow-x-auto no-scrollbar border-b border-slate-50">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: <Info size={18}/> },
            { id: "tasks", label: "Plan de Travail", icon: <FolderKanban size={18}/> },
            { id: "deliverables", label: "Livrables", icon: <FileCheck size={18}/> },
            { id: "team", label: "Équipe", icon: <Users size={18}/> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
              {tab.icon} {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENU DYNAMIQUE */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-6"><FileText className="text-indigo-500" /> Problématique</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">{projet.problematique}</p>
                    </div>
                </div>
                <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-xl">
                    <h3 className="text-xl font-black mb-4">Objectifs du Projet</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed opacity-90">{projet.objectifs}</p>
                </div>
            </div>
        )}

        {activeTab === "tasks" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {projet.work_packages?.map((wp) => (
                    <div key={wp.id} className="space-y-4">
                        <div className="flex justify-between items-center px-6">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{wp.code_wp} : {wp.titre}</h4>
                            {isChefDeProjet && (
                                <button onClick={() => setShowTacheModal(wp)} className="text-[10px] font-black text-indigo-600 flex items-center gap-2">
                                    <PlusCircle size={14}/> Nouvelle tâche
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {wp.taches?.map((tache) => (
                                <div key={tache.id} 
                                     onClick={() => (isChefDeProjet || Number(tache.responsable_id) === Number(myId)) && navigate(`/chercheur/taches/${tache.id}`)}
                                     className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${tache.etat === 'Terminé' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {tache.etat === 'Terminé' ? <CheckCircle2 size={18}/> : <Clock size={18}/>}
                                        </div>
                                        <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <h5 className="font-black text-slate-800 text-sm">{tache.nom}</h5>
                                    <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold">Resp: {tache.responsable?.nom || 'Non assigné'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === "deliverables" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                {livrablesRemplis.length > 0 ? (
                  livrablesRemplis.map(livrable => (
                    <div key={livrable.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><FileCheck size={24}/></div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm">{livrable.titre}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Validé le {new Date(livrable.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDownload(livrable)} className="p-3 text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"><Download size={20}/></button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase text-[10px]">Aucun livrable disponible pour le moment</p>
                  </div>
                )}
            </div>
        )}

        {activeTab === "team" && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black text-slate-800">Équipe du Projet</h3>
                    {isChefDeProjet && (
                        <button onClick={() => setShowTeamModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center gap-2">
                            <Users size={16}/> Gérer l'équipe
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projet.membres?.map(membre => (
                        <div key={membre.id} className="flex items-center gap-4 p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black shadow-sm border border-slate-100">
                                {membre.nom[0]}{membre.prenom[0]}
                            </div>
                            <div>
                                <p className="font-black text-sm text-slate-800">{membre.prenom} {membre.nom}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black flex items-center gap-1.5">
                                    {Number(membre.id) === Number(projet.chef_projet_id) ? (
                                        <><ShieldCheck size={12} className="text-amber-500"/> Responsable</>
                                    ) : (
                                        membre.pivot?.qualite || 'Membre'
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* MODALES */}
      {showWPModal && <WorkPackageModal projet={projet} onClose={() => setShowWPModal(false)} onRefresh={fetchProjectDetails} />}
      {showTacheModal && <TacheModal wp={showTacheModal} membres={projet.membres} onClose={() => setShowTacheModal(null)} onRefresh={fetchProjectDetails} />}
      {showTeamModal && <ManageTeamModal projet={projet} onClose={() => setShowTeamModal(false)} onRefresh={fetchProjectDetails} />}
    </div>
  );
}