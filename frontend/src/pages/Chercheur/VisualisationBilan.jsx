import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Download, Loader2, AlertCircle, 
    Calendar, Percent, FileText, CheckCircle2, Clock,
    Users, BookOpen, Cpu, GraduationCap, Microscope, Shield, Send
} from 'lucide-react';
import axiosClient from "../../api/axios";
import Swal from 'sweetalert2';

const VisualisationBilan = () => {
    const { projetId, bilanId } = useParams();
    const navigate = useNavigate();
    
    const [bilan, setBilan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false); // État pour le chargement de soumission
    const [error, setError] = useState(null);

    const fetchBilanDetails = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/bilans/${bilanId}`);
            setBilan(response.data);
        } catch (err) {
            console.error("Erreur chargement détail bilan:", err);
            setError("Impossible de charger les détails du bilan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bilanId) fetchBilanDetails();
    }, [bilanId]);

    // --- LOGIQUE DE SOUMISSION ---
    const handleSoumettre = async () => {
        const result = await Swal.fire({
            title: 'Soumettre le bilan ?',
            text: "Une fois soumis, l'état passera en 'Soumis' et les modifications ne seront plus possibles.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Oui, soumettre',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            setSubmitting(true);
            try {
                await axiosClient.patch(`/bilans/${bilanId}/soumettre`);
                await Swal.fire('Succès', 'Le bilan a été soumis avec succès.', 'success');
                fetchBilanDetails(); // Rafraîchir pour mettre à jour le statut
            } catch (err) {
                Swal.fire('Erreur', 'Échec de la soumission.', 'error');
            } finally {
                setSubmitting(false);
            }
        }
    };

    // --- LOGIQUE EXPORT PDF ---
    const handleDownloadPDF = async () => {
        try {
            const response = await axiosClient.get(`/bilans/${bilanId}/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bilan_${bilan.annee}_${bilan.projet?.titre}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            Swal.fire('Erreur', 'Impossible de générer le PDF.', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Extraction des données...</p>
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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 gap-4">
                <button 
                    onClick={() => navigate(`/chercheur/projets/${projetId}/bilans-liste`)}
                    className="flex items-center gap-2 px-5 py-2 text-slate-500 hover:text-indigo-600 font-black uppercase text-[10px] transition-all"
                >
                    <ArrowLeft size={16} /> Retour à l'historique
                </button>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${
                        bilan.etat_validation === 'Validé' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                        Statut: {bilan.etat_validation}
                    </span>

                    {/* AJOUT : BOUTON SOUMETTRE CONDITIONNEL */}
                    {bilan.etat_validation === 'Brouillon' && (
                        <button 
                            onClick={handleSoumettre}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Soumettre
                        </button>
                    )}

                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-slate-800 transition-all shadow-lg"
                    >
                        <Download size={16} /> Exporter PDF
                    </button>
                </div>
            </div>

            {/* Le reste du design demeure strictement identique */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                    <div>
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Identification du Projet</p>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{bilan.projet?.titre}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-[10px] font-black uppercase italic">Année du bilan</p>
                        <p className="text-3xl font-black text-indigo-400">{bilan.annee}</p>
                    </div>
                </div>
                {/* ... suite de votre design ... */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Microscope size={14} className="text-indigo-500"/> Structure
                        </h4>
                        <p className="text-xs font-bold text-slate-700">{bilan.projet?.division?.nom}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{bilan.projet?.division?.acronyme}</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Shield size={14} className="text-indigo-500"/> Type & Nature
                        </h4>
                        <p className="text-xs font-bold text-slate-700">{bilan.projet?.type} - {bilan.projet?.nature}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Durée: {bilan.projet?.duree_mois} mois</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Calendar size={14} className="text-indigo-500"/> Période
                        </h4>
                        <p className="text-xs font-bold text-slate-700">Début: {new Date(bilan.projet?.date_debut).toLocaleDateString()}</p>
                        <p className="text-xs font-bold text-slate-700">Fin: {new Date(bilan.projet?.date_fin).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Participants */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" /> Participants au projet
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase">Nom & Prénom</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase">Grade</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase">Qualité</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase text-right">Participation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bilan.projet?.membres?.map((membre) => (
                                <tr key={membre.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 text-xs font-bold text-slate-700">{membre.nom} {membre.prenom}</td>
                                    <td className="py-4 text-xs text-slate-500">{membre.grade}</td>
                                    <td className="py-4">
                                        <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                            {membre.pivot?.qualite}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right font-black text-indigo-600 text-xs">
                                        {membre.pivot?.pourcentage_participation}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3 & 4 : Objectifs et Résultats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={18} /> 3. Objectifs Réalisés
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed italic">
                        "{bilan.objectifs_realises}"
                    </p>
                    <div className="pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Avancement global</p>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full transition-all duration-1000" style={{width: `${bilan.avancement_physique}%`}}></div>
                        </div>
                        <p className="mt-2 text-right font-black text-indigo-600 text-lg">{bilan.avancement_physique}%</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen size={18} /> 4.1 Production Scientifique
                    </h3>
                    <div className="space-y-4">
                        {bilan.productions_scientifiques?.map((pub) => (
                            <div key={pub.id} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                <p className="text-[9px] font-black text-emerald-700 uppercase mb-1">{pub.type}</p>
                                <p className="text-xs font-bold text-slate-800 mb-1">{pub.titre}</p>
                                <p className="text-[10px] text-slate-500 italic">{pub.revue_ou_conference} ({new Date(pub.date_parution).getFullYear()})</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                        <Cpu size={18} /> 4.2 Production Technologique
                    </h3>
                    <div className="space-y-4">
                        {bilan.productions_technologiques?.map((tech) => (
                            <div key={tech.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-black text-amber-700 uppercase bg-white px-2 py-1 rounded-md border border-amber-100">{tech.type}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{tech.reference}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 mb-1">{tech.intitule}</p>
                                <p className="text-[10px] text-slate-600 leading-tight">{tech.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap size={18} /> 4.3 Formation pour la recherche
                    </h3>
                    <div className="space-y-3">
                        {bilan.encadrements?.map((enc) => (
                            <div key={enc.id} className="flex items-center justify-between p-3 border-b border-slate-50">
                                <div>
                                    <p className="text-xs font-bold text-slate-700">{enc.nom_etudiant}</p>
                                    <p className="text-[10px] text-slate-400">{enc.type_diplome} - {enc.etablissement}</p>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                                    enc.etat_avancement === 'Soutenu' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {enc.etat_avancement}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Difficultés */}
            <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100 shadow-sm">
                <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <AlertCircle size={20} /> 6. Difficultés Rencontrées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-tighter italic">6.1 Scientifiques</p>
                        <p className="text-xs text-rose-900 leading-relaxed font-medium">{bilan.difficultes_scientifiques || "Néant"}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-tighter italic">6.2 Matérielles</p>
                        <p className="text-xs text-rose-900 leading-relaxed font-medium">{bilan.difficultes_materielles || "Néant"}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-tighter italic">6.3 Humaines</p>
                        <p className="text-xs text-rose-900 leading-relaxed font-medium">{bilan.difficultes_humaines || "Néant"}</p>
                    </div>
                </div>
            </div>

            {/* Collaborations & Autres */}
            <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Collaborations (Section 5)</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{bilan.collaborations || "Aucune collaboration spécifique."}</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Autres Résultats</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{bilan.autres_resultats || "Pas d'autres résultats à signaler."}</p>
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 p-8 opacity-10">
                    <Shield size={120} />
                </div>
            </div>
        </div>
    );
};

export default VisualisationBilan;