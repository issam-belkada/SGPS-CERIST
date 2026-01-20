import { useState, useEffect } from "react";
import axiosClient from "../../api/axios";
import { X, Upload, Loader2, FileCheck, Info, AlertTriangle } from "lucide-react";

// Liste synchronisée avec votre migration Laravel/Postgres
const LIVRABLE_TYPES = [
  { value: "Rapport_Technique", label: "Rapport Technique" },
  { value: "Manuel_Utilisateur", label: "Manuel Utilisateur" },
  { value: "Code_Source", label: "Code Source" },
  { value: "Synthese_Biblio", label: "Synthèse Bibliographique" },
  { value: "Expertise", label: "Expertise" },
  { value: "Logiciel_Code", label: "Logiciel / Code" },
  { value: "Prototype", label: "Prototype" },
  { value: "Publication", label: "Publication" },
  { value: "Brevet", label: "Brevet" },
  { value: "Autre", label: "Autre" },
];

export default function LivrableModal({ tacheId, tacheNom, onClose, onRefresh, editLivrable }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    type: "Rapport_Technique",
    fichier: null,
  });

  useEffect(() => {
    if (editLivrable) {
      setFormData((prev) => ({
        ...prev,
        titre: editLivrable.titre || "",
        type: editLivrable.type || "Rapport_Technique",
      }));
    }
  }, [editLivrable]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fichier) return alert("Veuillez sélectionner un fichier");
    if (!formData.titre.trim()) return alert("Veuillez donner un titre au document");

    setLoading(true);
    
    const data = new FormData();
    data.append("titre", formData.titre);
    data.append("type", formData.type);
    data.append("fichier", formData.fichier);
    data.append("tache_id", tacheId);

    try {
      const url = editLivrable 
        ? `/livrables/${editLivrable.id}/upload-missing`
        : '/livrables/store-tache';

      await axiosClient.post(url, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (onRefresh) onRefresh(); 
      onClose();
    } catch (err) {
      console.error("Erreur d'upload:", err);
      alert(err.response?.data?.message || "Erreur lors du dépôt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden border border-white/20">
        
        {/* Header dynamique */}
        <div className={`p-8 border-b border-slate-50 flex justify-between items-center ${editLivrable ? 'bg-amber-50/50' : 'bg-slate-50/50'}`}>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {editLivrable ? "Finaliser le livrable" : "Nouveau livrable"}
            </h3>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-2">
              Mission : {tacheNom}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Section Information contextuelle */}
          {editLivrable ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-amber-800 font-black uppercase tracking-tight">Dépôt obligatoire</p>
                <p className="text-[11px] text-amber-700 leading-tight">
                  Ce livrable a été défini comme requis pour clore la tâche.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50">
              <Info size={18} className="text-indigo-500 shrink-0" />
              <p className="text-[11px] text-indigo-700 leading-tight font-medium">
                Le document sera automatiquement classé dans le répertoire du projet.
              </p>
            </div>
          )}

          {/* Champ Titre */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre du livrable</label>
            <input 
              required
              type="text"
              placeholder="Ex: Analyse de conformité V1"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all"
              value={formData.titre}
              onChange={e => setFormData({...formData, titre: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Champ Type via Enum */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
              <select 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 cursor-pointer focus:ring-2 focus:ring-indigo-500/10"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                {LIVRABLE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            {/* Zone d'upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fichier (Max 20Mo)</label>
              <label className={`w-full flex items-center justify-center h-[56px] px-5 rounded-2xl cursor-pointer transition-all font-black text-[10px] uppercase border-2 border-dashed overflow-hidden ${formData.fichier ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'}`}>
                <Upload size={16} className="mr-2 shrink-0" />
                <span className="truncate">{formData.fichier ? formData.fichier.name : "Choisir le fichier"}</span>
                <input type="file" className="hidden" onChange={e => setFormData({...formData, fichier: e.target.files[0]})} />
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-[2] py-4 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${editLivrable ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-indigo-600'}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20}/>
              ) : (
                <>
                  <FileCheck size={18}/>
                  <span>{editLivrable ? "Confirmer l'upload" : "Enregistrer"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}