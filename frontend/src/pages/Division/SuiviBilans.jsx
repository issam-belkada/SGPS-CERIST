import { useState, useEffect } from "react";
import axiosClient from "../../api/axios";
import { 
  CheckCircle, X, ChevronRight, Loader2, Calendar, 
  AlertCircle, Download, FileText, 
  CheckCircle2, Clock, Users, BookOpen, Cpu, Microscope, Shield
} from "lucide-react";
import Swal from "sweetalert2";

export default function SuiviBilans() {
  const [bilans, setBilans] = useState([]);
  const [selectedBilan, setSelectedBilan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchBilansSoumis = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/division/bilans-a-valider");
      setBilans(data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBilansSoumis(); }, []);

  // --- LOGIQUE EXPORT PDF ---
  const handleDownloadPDF = async (bilanId, titreProjet) => {
    try {
        const response = await axiosClient.get(`/bilans/${bilanId}/pdf`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Bilan_${titreProjet || bilanId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        Swal.fire('Erreur', 'Impossible de générer le PDF.', 'error');
    }
  };

  // --- LOGIQUE VALIDATION / REJET ---
  const handleAction = async (id, type) => {
    // Mapping pour éviter les problèmes d'accents dans la requête HTTP/SQL
    // On envoie des codes simples que le contrôleur traduira
    const payload = {
        etat_validation: type === 'Validé' ? 'Valide' : 'Rejete'
    };

    const result = await Swal.fire({
      title: `Confirmer la décision ?`,
      text: `Voulez-vous marquer ce bilan comme "${type}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: type === 'Validé' ? '#4f46e5' : '#ef4444',
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    setProcessing(true);
    try {
      // Appel API avec le payload sécurisé
      await axiosClient.put(`/bilans/${id}/valider`, payload);
      
      Swal.fire("Succès", "Le bilan a été mis à jour.", "success");
      setSelectedBilan(null);
      fetchBilansSoumis();
    } catch (err) {
      console.error("Erreur détaillée:", err.response?.data);
      Swal.fire("Erreur", "La base de données a rejeté la requête. Vérifiez l'encodage.", "error");
    } finally {
      setProcessing(false);
    }
};

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4">
      
      {/* HEADER PAGE */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Suivi des <span className="text-indigo-600">Bilans</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <Clock size={14} className="text-indigo-500"/> {bilans.length} bilans en attente de validation
            </p>
        </div>
      </div>

      {/* LISTE DES BILANS */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chargement...</span>
          </div>
        ) : (
          bilans.map((bilan) => (
            <div key={bilan.id} onClick={() => setSelectedBilan(bilan)} className="group bg-white rounded-[2.5rem] border border-slate-100 p-6 flex items-center gap-6 cursor-pointer hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400">
                <FileText size={20} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{bilan.projet?.titre}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Bilan Année {bilan.annee} — Chef: {bilan.projet?.chef_projet?.nom}</p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
          ))
        )}
      </div>

      {/* DRAWER DÉTAILS */}
      {selectedBilan && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" onClick={() => setSelectedBilan(null)} />
          <div className="fixed top-0 right-0 h-full w-full max-w-6xl bg-slate-50 z-[70] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
            
            {/* BARRE D'ACTION */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center">
                <button onClick={() => setSelectedBilan(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={18} /> Fermer
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleDownloadPDF(selectedBilan.id, selectedBilan.projet?.titre)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-slate-800 transition-all shadow-lg"
                    >
                        <Download size={16} /> PDF
                    </button>
                    <button onClick={() => handleAction(selectedBilan.id, 'Rejeté')} disabled={processing} className="px-6 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black uppercase text-[10px] hover:bg-rose-50 transition-all">
                        Rejeter
                    </button>
                    <button onClick={() => handleAction(selectedBilan.id, 'Validé')} disabled={processing} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-indigo-700 shadow-lg flex items-center gap-2">
                        {processing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Approuver
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-8 max-w-5xl mx-auto">
                {/* Identification */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden text-left">
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                        <div>
                            <p className="text-indigo-400 text-[10px] font-black uppercase mb-2">Identification</p>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">{selectedBilan.projet?.titre}</h2>
                        </div>
                        <p className="text-3xl font-black text-indigo-400">{selectedBilan.annee}</p>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div><h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Microscope size={14}/> Structure</h4><p className="text-xs font-bold text-slate-700">{selectedBilan.projet?.division?.nom}</p></div>
                        <div><h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Shield size={14}/> Type</h4><p className="text-xs font-bold text-slate-700">{selectedBilan.projet?.type}</p></div>
                        <div><h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Calendar size={14}/> Échéance</h4><p className="text-xs font-bold text-slate-700">{new Date(selectedBilan.projet?.date_fin).toLocaleDateString()}</p></div>
                    </div>
                </div>

                {/* Objectifs & Avancement */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4 text-left">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={18} /> Objectifs Réalisés</h3>
                    <p className="text-slate-600 text-sm leading-relaxed italic">"{selectedBilan.objectifs_realises}"</p>
                    <div className="pt-4 border-t border-slate-50">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{width: `${selectedBilan.avancement_physique}%`}}></div>
                        </div>
                        <p className="mt-2 text-right font-black text-indigo-600">{selectedBilan.avancement_physique}% réalisé</p>
                    </div>
                </div>

                {/* Productions Scientifiques/Technologiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4 text-left">
                        <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><BookOpen size={18} /> Scientifique</h3>
                        <div className="space-y-3">
                            {selectedBilan.productions_scientifiques?.length > 0 ? selectedBilan.productions_scientifiques.map((pub, i) => (
                                <div key={i} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <p className="text-[9px] font-black text-emerald-700 uppercase">{pub.type}</p>
                                    <p className="text-xs font-bold text-slate-800">{pub.titre}</p>
                                </div>
                            )) : <p className="text-xs text-slate-400 italic text-center">Aucune production</p>}
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4 text-left">
                        <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><Cpu size={18} /> Technologique</h3>
                        <div className="space-y-3">
                            {selectedBilan.productions_technologiques?.length > 0 ? selectedBilan.productions_technologiques.map((tech, i) => (
                                <div key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                    <p className="text-xs font-bold text-slate-800">{tech.intitule}</p>
                                    <p className="text-[10px] text-slate-600">{tech.description}</p>
                                </div>
                            )) : <p className="text-xs text-slate-400 italic text-center">Aucun livrable</p>}
                        </div>
                    </div>
                </div>

                {/* Difficultés */}
                <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100 text-left">
                    <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-6 flex items-center gap-2"><AlertCircle size={20} /> Difficultés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div><p className="text-[9px] font-black text-rose-400 uppercase mb-1 italic">Scientifiques</p><p className="text-xs text-rose-900">{selectedBilan.difficultes_scientifiques || "Néant"}</p></div>
                        <div><p className="text-[9px] font-black text-rose-400 uppercase mb-1 italic">Matérielles</p><p className="text-xs text-rose-900">{selectedBilan.difficultes_materielles || "Néant"}</p></div>
                        <div><p className="text-[9px] font-black text-rose-400 uppercase mb-1 italic">Humaines</p><p className="text-xs text-rose-900">{selectedBilan.difficultes_humaines || "Néant"}</p></div>
                    </div>
                </div>

                {/* Collaborations & Autres */}
                <div className="bg-slate-900 p-10 rounded-[4rem] text-white text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-2">
                            <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Collaborations</h4>
                            <p className="text-sm text-slate-300 leading-relaxed italic">{selectedBilan.collaborations || "Aucune collaboration."}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Autres Résultats</h4>
                            <p className="text-sm text-slate-300 leading-relaxed italic">{selectedBilan.autres_resultats || "Néant."}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}