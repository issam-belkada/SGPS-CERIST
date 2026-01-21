import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FileText, Download, ArrowLeft, AlertCircle, 
    FileCheck, Search, ChevronRight, Percent, Loader2, Send
} from 'lucide-react';
import axiosClient from "../../api/axios";
import Swal from 'sweetalert2';

const ListeBilansProjet = () => {
    const { projetId } = useParams(); 
    const navigate = useNavigate();

    const [bilans, setBilans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // Pour le loading sur un bouton précis
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("Tous");

    const fetchBilans = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get(`/projets/${projetId}/bilans`);
            setBilans(response.data);
        } catch (err) {
            setError("Impossible de charger l'historique.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBilans();
    }, [projetId]);

    // --- LOGIQUE SOUMISSION ---
    const handleSoumettre = async (e, bilanId) => {
        e.stopPropagation(); // Empêche d'ouvrir les détails
        const result = await Swal.fire({
            title: 'Soumettre ce bilan ?',
            text: "Il sera envoyé pour validation.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, soumettre',
            confirmButtonColor: '#4f46e5'
        });

        if (result.isConfirmed) {
            setActionLoading(bilanId);
            try {
                await axiosClient.patch(`/bilans/${bilanId}/soumettre`);
                Swal.fire('Succès', 'Bilan soumis.', 'success');
                fetchBilans();
            } catch (err) {
                Swal.fire('Erreur', 'Échec de la soumission.', 'error');
            } finally {
                setActionLoading(null);
            }
        }
    };

    // --- LOGIQUE PDF ---
    const handleDownloadPDF = async (e, bilanId, annee) => {
        e.stopPropagation();
        try {
            const response = await axiosClient.get(`/bilans/${bilanId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bilan_${annee}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            Swal.fire('Erreur', 'Échec PDF.', 'error');
        }
    };

    const filteredBilans = useMemo(() => {
        return bilans.filter(bilan => {
            const matchesSearch = searchTerm === "" || bilan.annee.toString().includes(searchTerm);
            const matchesStatus = filterStatus === "Tous" || bilan.etat_validation === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [bilans, searchTerm, filterStatus]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chargement de l'historique...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-10">
            {/* Header */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <button 
                            onClick={() => navigate(`/chercheur/projet/${projetId}`)} 
                            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase transition-all"
                        >
                            <ArrowLeft size={14}/> Retour au projet
                        </button>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Historique Bilans</h2>
                    </div>

                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-slate-400" size={14} />
                        <input 
                            type="text"
                            placeholder="Rechercher une année..."
                            className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none w-64 focus:ring-2 ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* FILTRAGE STYLE "PILLS" */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-2xl w-fit">
                    {["Tous", "Brouillon", "Soumis", "Validé", "Rejeté"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                filterStatus === status 
                                ? "bg-white text-indigo-600 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grille des bilans */}
            <div className="grid gap-4">
                {filteredBilans.length === 0 ? (
                    <div className="p-20 border-2 border-dashed border-slate-200 rounded-[3.5rem] text-center bg-white/50">
                        <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-black uppercase text-[10px]">Aucun bilan correspondant</p>
                    </div>
                ) : (
                    filteredBilans.map((b) => (
                        <div 
                            key={b.id}
                            onClick={() => navigate(`/chercheur/projets/${projetId}/bilans/${b.id}`)}
                            className="group bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                    b.etat_validation === 'Validé' ? 'bg-emerald-50 text-emerald-600' : 
                                    b.etat_validation === 'Soumis' ? 'bg-indigo-50 text-indigo-600' : 
                                    b.etat_validation === 'Rejeté' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    <FileText size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase text-lg">Année {b.annee}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                            b.etat_validation === 'Validé' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                            b.etat_validation === 'Soumis' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            b.etat_validation === 'Rejeté' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {b.etat_validation}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                                            <Percent size={10} className="text-indigo-400" /> {b.avancement_physique}% 
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* ACTIONS RAPIDES */}
                            <div className="flex items-center gap-2">
                                {b.etat_validation === 'Brouillon' && (
                                    <button 
                                        onClick={(e) => handleSoumettre(e, b.id)}
                                        disabled={actionLoading === b.id}
                                        className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group/btn"
                                        title="Soumettre maintenant"
                                    >
                                        {actionLoading === b.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                )}
                                
                                <button 
                                    onClick={(e) => handleDownloadPDF(e, b.id, b.annee)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                                    title="Télécharger PDF"
                                >
                                    <Download size={16} />
                                </button>

                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm ml-2">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ListeBilansProjet;