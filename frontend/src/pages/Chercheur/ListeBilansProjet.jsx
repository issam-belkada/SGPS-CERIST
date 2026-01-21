import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FileText, Download, ArrowLeft, AlertCircle, 
    FileCheck, Search, ChevronRight, Percent, Loader2 
} from 'lucide-react';
import axiosClient from "../../api/axios";

const ListeBilansProjet = () => {
    const { projetId } = useParams(); 
    const navigate = useNavigate();

    const [bilans, setBilans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("Tous");

    const fetchBilans = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!projetId || projetId === ":projetId") {
                throw new Error("ID du projet manquant");
            }
            const response = await axiosClient.get(`/projets/${projetId}/bilans`);
            setBilans(response.data);
        } catch (err) {
            console.error("Erreur API Bilans:", err);
            setError("Impossible de charger l'historique.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBilans();
    }, [projetId]);

    const filteredBilans = useMemo(() => {
        return bilans.filter(bilan => {
            const matchesSearch = searchTerm === "" || bilan.annee.toString().includes(searchTerm);
            const matchesStatus = filterStatus === "Tous" || bilan.etat_validation === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [bilans, searchTerm, filterStatus]);

    // --- FONCTION DE REDIRECTION ---
    const handleViewBilan = (bilanId) => {
        // Redirige vers la route : /chercheur/projets/:projetId/bilans/:bilanId
        navigate(`/chercheur/projets/${projetId}/bilans/${bilanId}`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chargement...</p>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <AlertCircle className="mx-auto text-rose-500 mb-4" size={40} />
            <p className="text-slate-600 font-bold">{error}</p>
            <button onClick={fetchBilans} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase">Réessayer</button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div>
                    <button 
                        onClick={() => navigate(`/chercheur/projet/${projetId}`)} 
                        className="mb-4 flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase transition-all"
                    >
                        <ArrowLeft size={14}/> Retour au projet
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Historique Bilans</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <FileCheck size={14} className="text-indigo-500"/> Liste des canevas annuels
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text"
                            placeholder="Année..."
                            className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none w-40"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="Tous">Tous les statuts</option>
                        <option value="Brouillon">Brouillon</option>
                        <option value="Soumis">Soumis</option>
                        <option value="Validé">Validé</option>
                        <option value="Rejeté">Rejeté</option>
                    </select>
                </div>
            </div>

            {/* Grille des bilans */}
            <div className="grid gap-4">
                {filteredBilans.length === 0 ? (
                    <div className="p-20 border-2 border-dashed border-slate-200 rounded-[3.5rem] text-center bg-white/50">
                        <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-black uppercase text-[10px]">Aucun bilan trouvé</p>
                    </div>
                ) : (
                    filteredBilans.map((b) => (
                        <div 
                            key={b.id}
                            // Appel de la fonction de redirection au clic
                            onClick={() => handleViewBilan(b.id)}
                            className="group bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                    b.etat_validation === 'Validé' ? 'bg-emerald-50 text-emerald-600' : 
                                    b.etat_validation === 'Soumis' ? 'bg-indigo-50 text-indigo-600' : 
                                    b.etat_validation === 'Rejeté' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    <FileText size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase text-lg">Année {b.annee}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                            b.etat_validation === 'Validé' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {b.etat_validation}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                                            <Percent size={10} className="text-indigo-400" /> {b.avancement_physique}% 
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ListeBilansProjet;