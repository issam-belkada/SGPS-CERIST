import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios";
import { 
  ArrowLeft, Edit, Mail, Shield, Building, 
  User, Calendar, GraduationCap, BookOpen, Loader2, Trash2, AlertCircle 
} from "lucide-react";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // État pour la modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosClient.get(`/users/${id}`)
      .then(({ data }) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate("/admin/users");
      });
  }, [id, navigate]);

  const confirmDelete = () => {
    setShowDeleteModal(false);
    axiosClient.delete(`/users/${id}`)
      .then(() => navigate("/admin/users"))
      .catch(err => alert(err.response?.data?.error || "Erreur lors de la suppression"));
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Chargement du profil...</p>
      </div>
    );
  }

  const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : "Chercheur";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      {/* MODAL DE CONFIRMATION STYLISÉE */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Supprimer ce profil ?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Toutes les données liées à <span className="font-bold text-slate-800">{user.nom} {user.prenom}</span> seront définitivement retirées du système.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation haute */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/users" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors group"
        >
          <div className="p-2 group-hover:bg-white rounded-full transition-all">
            <ArrowLeft size={20} />
          </div>
          Retour à la liste
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-white border border-red-100 text-red-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-red-50 transition-all shadow-sm"
          >
            <Trash2 size={18} />
            Supprimer
          </button>
          <Link 
            to={`/admin/users/${id}/edit`}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            <Edit size={18} />
            Modifier le profil
          </Link>
        </div>
      </div>

      {/* En-tête du profil avec dégradé */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-800 to-indigo-900"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl">
              <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 border border-slate-200">
                {user.nom.charAt(0)}{user.prenom.charAt(0)}
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200 bg-blue-50 text-blue-700`}>
              {roleName}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase leading-none">{user.nom} {user.prenom}</h1>
            <p className="text-slate-400 font-bold flex items-center gap-2 mt-2 uppercase text-xs tracking-tighter">
              <BookOpen size={14} className="text-indigo-500" /> {user.specialite || "Chercheur CERIST"}
            </p>
          </div>
        </div>
      </div>

      {/* Grille d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Informations Professionnelles
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-2">
                   Adresse Email
                </label>
                <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <Mail size={18} className="text-blue-500" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-2">
                   Grade Actuel
                </label>
                <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <GraduationCap size={18} className="text-amber-500" />
                  {user.grade}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-2">
                   Division
                </label>
                <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <Building size={18} className="text-emerald-500" />
                  {user.division ? user.division.acronyme : "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-2">
                   Membre depuis
                </label>
                <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <Calendar size={18} className="text-purple-500" />
                  {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status latéral */}
        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl shadow-slate-200 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <Shield className="text-blue-400" size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">Compte</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Rôle Système</p>
                <p className="font-bold text-lg">{roleName}</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase font-black text-slate-500 mb-1">État</p>
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                  Connecté
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 font-medium mt-10">
            ID: {user.id} • Système de Gestion CERIST
          </p>
        </div>
      </div>
    </div>
  );
}