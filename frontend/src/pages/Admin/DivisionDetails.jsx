import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axios";
import { ArrowLeft, User, Mail, Loader2, Crown, UserCheck, Info, AlertTriangle, X } from "lucide-react";

export default function DivisionDetails() {
  const { id } = useParams();
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour la confirmation stylisée
  const [confirmModal, setConfirmModal] = useState({ show: false, userId: null, userName: "" });

  const fetchDivisionData = () => {
    setLoading(true);
    axiosClient.get(`/divisions/${id}`)
      .then(({ data }) => {
        setDivision(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchDivisionData(); }, [id]);

  // Déclenche l'affichage de la modal au lieu du confirm()
  const openConfirmModal = (u) => {
    setConfirmModal({ show: true, userId: u.id, userName: `${u.nom} ${u.prenom}` });
  };

  const handleAssignChef = () => {
    const userId = confirmModal.userId;
    setConfirmModal({ ...confirmModal, show: false }); // Fermer la modal
    
    axiosClient.put(`/divisions/${id}/assign-chef`, { chef_id: userId })
      .then(() => fetchDivisionData())
      .catch(err => alert("Erreur : " + err.response?.data?.message));
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      {/* MODAL DE CONFIRMATION STYLISÉE */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                <Crown size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Confirmer la nomination</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Voulez-vous désigner <span className="font-bold text-slate-800">{confirmModal.userName}</span> comme nouveau Chef de Division ? 
                  <br /> <span className="text-xs italic text-amber-600 font-medium">L'ancien chef redeviendra automatiquement chercheur.</span>
                </p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <button 
                  onClick={() => setConfirmModal({ show: false, userId: null, userName: "" })}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAssignChef}
                  className="flex-1 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg shadow-slate-200 transition-transform active:scale-95"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Link to="/admin/divisions" className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20}/> Retour aux divisions
      </Link>

      {/* Header avec statut du Chef */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-lg text-[10px] font-black uppercase tracking-widest">Structure de Recherche</span>
            <h1 className="text-3xl font-black">{division.nom}</h1>
            <p className="text-slate-400 font-bold text-lg">{division.acronyme}</p>
          </div>
          
          {division.chef ? (
            <div className="bg-amber-400 text-amber-950 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="bg-amber-950/10 p-2 rounded-xl"><Crown size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-70">Chef de Division</p>
                <p className="font-black text-lg leading-tight">{division.chef.nom} {division.chef.prenom}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 text-slate-400 p-4 rounded-2xl flex items-center gap-3 border border-slate-700">
              <Info size={20} />
              <p className="text-sm font-bold tracking-tight">Aucun chef assigné</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche: Liste des membres */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-2">
            <User size={20} className="text-indigo-500" /> Membres de la division
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {division.users?.map(u => {
              const isChef = division.chef_id === u.id;
              return (
                <div key={u.id} className={`bg-white p-5 rounded-2xl border transition-all flex items-center justify-between ${isChef ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200 hover:border-indigo-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${isChef ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {u.nom[0]}{u.prenom[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 uppercase text-sm">{u.nom} {u.prenom}</p>
                      <p className="text-xs text-slate-500 font-bold">{u.grade}</p>
                    </div>
                  </div>

                  {isChef ? (
                    <span className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                      <UserCheck size={14} /> Responsable
                    </span>
                  ) : (
                    <button 
                      onClick={() => openConfirmModal(u)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all group"
                    >
                      <Crown size={14} className="group-hover:scale-110 transition-transform" />
                      Nommer Chef
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne Droite: Infos complémentaires */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 text-sm mb-4">Description</h3>
            <p className="text-slate-500 text-sm leading-relaxed italic">
              {division.description || "Aucune description enregistrée pour cette division."}
            </p>
          </div>
          
          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Effectif</p>
            <p className="text-4xl font-black">{division.users?.length || 0}</p>
            <p className="text-indigo-200 text-xs mt-4">Chercheurs et personnels rattachés à cette structure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}