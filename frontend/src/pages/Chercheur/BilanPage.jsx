import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormulaireBilan from './FormulaireBilan';
import { ArrowLeft, Loader2 } from 'lucide-react';

const BilanPage = () => {
    const { id } = useParams(); // Récupère l'ID du projet depuis l'URL
    const navigate = useNavigate();
    const [projet, setProjet] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Charger les détails du projet pour le contexte
                const resProjet = await axios.get(`projets/${id}`);
                setProjet(resProjet.data);

                // 2. Tenter de charger un bilan existant (brouillon) pour l'année en cours
                const anneeCourante = new Date().getFullYear();
                const resBilan = await axios.get(`projets/${id}/bilans/${anneeCourante}`);
                
                if (resBilan.data) {
                    setInitialData(resBilan.data);
                }
            } catch (err) {
                console.error("Erreur de chargement", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto mb-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium"
                >
                    <ArrowLeft size={20} /> Retour au projet
                </button>
                <div className="mt-4">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rédaction du Bilan Annuel</h2>
                    <h1 className="text-2xl font-black text-slate-800">{projet?.titre}</h1>
                </div>
            </div>

            {/* Affichage du composant finalisé */}
            <FormulaireBilan projetId={id} initialData={initialData} />
        </div>
    );
};

export default BilanPage;