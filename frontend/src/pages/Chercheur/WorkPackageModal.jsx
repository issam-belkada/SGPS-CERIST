import React, { useState } from 'react';
import { X, LayoutGrid, calendar, Save, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axios';

export default function WorkPackageModal({ projet, onClose, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titre: '',
        code_wp: `WP${(projet.work_packages?.length || 0) + 1}`,
        date_debut: projet.date_debut,
        date_fin: projet.date_fin,
        projet_id: projet.id
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/work-packages', formData);
            onRefresh(); // Recharge les détails du projet
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nouveau WP</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Structuration du projet</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Code</label>
                            <input 
                                type="text" value={formData.code_wp}
                                onChange={(e) => setFormData({...formData, code_wp: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Titre du Work Package</label>
                            <input 
                                type="text" required placeholder="ex: Analyse des besoins"
                                value={formData.titre}
                                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Date Début</label>
                            <input 
                                type="date" required
                                min={projet.date_debut} max={projet.date_fin}
                                value={formData.date_debut}
                                onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Date Fin</label>
                            <input 
                                type="date" required
                                min={formData.date_debut} max={projet.date_fin}
                                value={formData.date_fin}
                                onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Enregistrer le Work Package
                    </button>
                </form>
            </div>
        </div>
    );
}