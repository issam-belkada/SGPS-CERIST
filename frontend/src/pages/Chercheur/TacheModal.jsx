import React, { useState } from 'react';
import { X, ClipboardList, UserPlus, Calendar, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axios';

export default function TacheModal({ wp, membres, onClose, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [livrablesAttendu, setLivrablesAttendu] = useState([{ titre: '', type: 'rapport_technique' }]);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        date_debut: wp.date_debut,
        date_fin: wp.date_fin,
        responsable_id: '',
        work_package_id: wp.id
    });

    const addLivrableField = () => {
        setLivrablesAttendu([...livrablesAttendu, { titre: '', type: 'rapport_technique' }]);
    };

    const removeLivrableField = (index) => {
        setLivrablesAttendu(livrablesAttendu.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.responsable_id) return alert("Veuillez assigner un responsable");
        
        setLoading(true);
        try {
            await axiosClient.post('/taches', {
                ...formData,
                livrables: livrablesAttendu // On envoie la structure des livrables à créer
            });
            onRefresh();
            onClose();
        } catch (err) {
            alert("Erreur lors de la création de la tâche");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md p-8 border-b border-slate-100 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nouvelle Tâche</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WP: {wp.titre}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Infos de base */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nom de la tâche</label>
                            <input type="text" required value={formData.nom} onChange={(e)=>setFormData({...formData, nom: e.target.value})}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"/>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Assigner à</label>
                            <select required value={formData.responsable_id} onChange={(e)=>setFormData({...formData, responsable_id: e.target.value})}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Sélectionner un chercheur...</option>
                                {membres?.map(m => (
                                    <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Début</label>
                            <input type="date" min={wp.date_debut} max={wp.date_fin} value={formData.date_debut} onChange={(e)=>setFormData({...formData, date_debut: e.target.value})}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs"/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Fin</label>
                            <input type="date" min={formData.date_debut} max={wp.date_fin} value={formData.date_fin} onChange={(e)=>setFormData({...formData, date_fin: e.target.value})}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs"/>
                        </div>
                    </div>

                    {/* Section Livrables attendus */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Livrables à fournir</h3>
                            <button type="button" onClick={addLivrableField} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {livrablesAttendu.map((liv, idx) => (
                                <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-right-4">
                                    <input type="text" placeholder="Nom du livrable (ex: Rapport Final)" required
                                        value={liv.titre} onChange={(e) => {
                                            const newL = [...livrablesAttendu];
                                            newL[idx].titre = e.target.value;
                                            setLivrablesAttendu(newL);
                                        }}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                    <select value={liv.type} onChange={(e) => {
                                            const newL = [...livrablesAttendu];
                                            newL[idx].type = e.target.value;
                                            setLivrablesAttendu(newL);
                                        }}
                                        className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none">
                                        <option value="rapport_technique">Rapport</option>
                                        <option value="publication">Publication</option>
                                        <option value="code_source">Code</option>
                                    </select>
                                    {livrablesAttendu.length > 1 && (
                                        <button type="button" onClick={() => removeLivrableField(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Créer la tâche et notifier
                    </button>
                </form>
            </div>
        </div>
    );
}