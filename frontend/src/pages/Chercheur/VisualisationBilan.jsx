import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Download, Loader2, AlertCircle, 
    Calendar, Percent, FileText, CheckCircle2, Clock
} from 'lucide-react';
import axiosClient from "../../api/axios";

const VisualisationBilan = () => {
    const { projetId, bilanId } = useParams();
    const navigate = useNavigate();
    
    const [bilan, setBilan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBilanDetails = async () => {
            setLoading(true);
            try {
                // On récupère les détails d'un bilan spécifique
                const response = await axiosClient.get(`/bilans/${bilanId}`);
                setBilan(response.data);
            } catch (err) {
                console.error("Erreur chargement détail bilan:", err);
                setError("Impossible de charger les détails du bilan.");
            } finally {
                setLoading(false);
            }
        };

        if (bilanId) fetchBilanDetails();
    }, [bilanId]);

    const handlePrint = async () => {
        try {
            const response = await axiosClient.get(`/bilans/${bilanId}/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bilan_Annuel_${bilan.annee}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Erreur lors de la génération du PDF");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chargement du bilan...</p>
        </div>
    );

    if (error || !bilan) return (
        <div className="p-10 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
            <p className="text-slate-600 font-bold">{error || "Bilan introuvable"}</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 underline text-xs font-bold uppercase">Retour</button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Barre d'actions supérieure */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <button 
                    onClick={() => navigate(`/chercheur/projets/${projetId}/bilans-liste`)}
                    className="flex items-center gap-2 px-5 py-2 text-slate-500 hover:text-indigo-600 font-black uppercase text-[10px] transition-all"
                >
                    <ArrowLeft size={16} /> Retour à l'historique
                </button>
                
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-slate-800 transition-all shadow-lg"
                >
                    <Download size={16} /> Télécharger en PDF
                </button>
            </div>

            {/* En-tête du Bilan */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase">
                                Bilan Annuel {bilan.annee}
                            </span>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                                bilan.etat_validation === 'Validé' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                                {bilan.etat_validation}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Récapitulatif de l'exercice</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Avancement Physique</p>
                            <div className="flex items-center gap-2">
                                <Percent size={14} className="text-indigo-600" />
                                <span className="text-xl font-black text-slate-800">{bilan.avancement_physique}%</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Avancement Financier</p>
                            <div className="flex items-center gap-2">
                                <Percent size={14} className="text-emerald-600" />
                                <span className="text-xl font-black text-slate-800">{bilan.avancement_financier}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corps du Bilan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* État des travaux */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={16} /> État des travaux réalisés
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {bilan.etat_travaux || "Aucune description fournie."}
                    </p>
                </div>

                {/* Difficultés rencontrées */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={16} /> Difficultés et contraintes
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {bilan.difficultes || "Aucune difficulté signalée."}
                    </p>
                </div>

                {/* Perspectives */}
                <div className="md:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={16} /> Perspectives pour l'année suivante
                    </h3>
                    <p className="text-indigo-50/80 text-sm leading-relaxed">
                        {bilan.perspectives || "Pas de perspectives enregistrées."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VisualisationBilan;