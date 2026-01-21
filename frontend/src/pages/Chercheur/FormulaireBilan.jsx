import React, { useState, useEffect } from 'react';
import { 
    Save, Send, Plus, Trash2, FileText, GraduationCap, 
    BarChart3, PlusCircle, Beaker, Cpu, AlertTriangle, Users,
    X, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import axiosClient from "../../api/axios";

const FormulaireBilan = ({ projetId, initialData = null }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [formData, setFormData] = useState({
        id: null,
        annee: new Date().getFullYear(), 
        avancement_physique: 0,
        objectifs_realises: '',
        collaborations: '',
        difficultes_scientifiques: '',
        difficultes_materielles: '',
        difficultes_humaines: '',
        autres_resultats: '',
        productions_sci: [],
        productions_tech: [],
        encadrements: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ 
                ...prev, 
                ...initialData,
                productions_sci: initialData.productions_sci || [],
                productions_tech: initialData.productions_tech || [],
                encadrements: initialData.encadrements || []
            }));
        }
    }, [initialData]);

    const notify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const addRow = (section, initialObj) => {
        setFormData(prev => ({ ...prev, [section]: [...prev[section], initialObj] }));
    };

    const removeRow = (section, index) => {
        setFormData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
    };

    const handleDynamicChange = (section, index, field, value) => {
        const newArray = [...formData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData(prev => ({ ...prev, [section]: newArray }));
    };

    const handleSave = async (showNotify = true) => {
        setLoading(true);
        try {
            const response = await axiosClient.post(`/projets/${projetId}/bilan/sauvegarder`, { 
                ...formData, 
                etat_validation: 'Brouillon' 
            });
            
            const newId = response.data?.bilan?.id || response.data?.id;
            if (newId) {
                setFormData(prev => ({ ...prev, id: newId }));
            }
            
            if(showNotify) notify('success', "Brouillon enregistré !");
            return newId || formData.id; 
        } catch (error) {
            notify('error', "Erreur lors de l'enregistrement.");
            return false;
        } finally { setLoading(false); }
    };

    const handleFinalSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        try {
            const currentId = await handleSave(false);
            if (!currentId) throw new Error("Impossible de générer un ID de bilan.");
            await axiosClient.patch(`/bilans/${currentId}/soumettre`);
            notify('success', "Bilan soumis officiellement !");
        } catch (error) {
            notify('error', error.response?.data?.error || "Échec de la soumission.");
        } finally { setLoading(false); }
    };

    return (
        <div className="relative space-y-8 animate-in fade-in duration-500 pb-20">
            
            {notification && (
                <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 ${
                    notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                    <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100"><X size={14}/></button>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-6 text-center border border-slate-100">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
                            <Send size={32} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Confirmer la soumission</h3>
                            <p className="text-slate-500 text-[11px] mt-4 font-medium leading-relaxed">
                                Une fois soumis, ce bilan sera transmis au conseil scientifique et ne pourra plus être modifié.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-colors">Annuler</button>
                            <button onClick={handleFinalSubmit} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white/90 backdrop-blur-md sticky top-4 z-50 p-4 rounded-[2.5rem] border border-slate-100 shadow-xl flex justify-between items-center">
                <div className="flex items-center gap-4 ml-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <FileText size={24} />}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900 uppercase">Bilan Annuel</h2>
                            <input 
                                type="number" 
                                value={formData.annee} 
                                onChange={(e) => setFormData({...formData, annee: parseInt(e.target.value) || new Date().getFullYear()})} 
                                className="w-24 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-indigo-600 focus:outline-none" 
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => handleSave()} disabled={loading} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-200 transition-all">
                        <Save size={16} /> Sauvegarder
                    </button>
                    <button 
                        onClick={() => setShowConfirmModal(true)} 
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                        <Send size={16} /> Soumettre
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'general', label: 'Progrès', icon: <BarChart3 size={18}/> },
                        { id: 'scientifique', label: 'Prod. Scientifique', icon: <Beaker size={18}/> },
                        { id: 'technique', label: 'Prod. Technique', icon: <Cpu size={18}/> },
                        { id: 'formation', label: 'Encadrement', icon: <GraduationCap size={18}/> },
                        { id: 'contraintes', label: 'Difficultés', icon: <AlertTriangle size={18}/> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all ${activeTab === tab.id ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400 hover:bg-white/50'}`}>
                            {tab.icon} <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3">
                    {activeTab === 'general' && (
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Avancement Physique (%)</label>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mt-2">
                                    <input type="range" min="0" max="100" value={formData.avancement_physique} onChange={(e) => setFormData({...formData, avancement_physique: parseInt(e.target.value)})} className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none accent-indigo-600" />
                                    <span className="text-xl font-black text-indigo-600">{formData.avancement_physique}%</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Résumé des travaux</label>
                                <textarea value={formData.objectifs_realises} onChange={(e) => setFormData({...formData, objectifs_realises: e.target.value})} placeholder="Objectifs réalisés..." className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm min-h-[150px] focus:ring-2 focus:ring-indigo-500" />
                                <textarea value={formData.collaborations} onChange={(e) => setFormData({...formData, collaborations: e.target.value})} placeholder="Collaborations..." className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'scientifique' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                            <div className="flex justify-between items-center mb-6 px-4">
                                <h3 className="font-black uppercase text-slate-800 tracking-tighter">Publications & Communications</h3>
                                <button onClick={() => addRow('productions_sci', { type: 'Publication_Inter', titre: '', auteurs: '', revue_ou_conference: '', date_parution: '' })} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><PlusCircle /></button>
                            </div>
                            {formData.productions_sci.map((item, idx) => (
                                <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] mb-4 relative grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button onClick={() => removeRow('productions_sci', idx)} className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md text-red-500"><Trash2 size={14}/></button>
                                    <div className="md:col-span-2">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Type</label>
                                        <select value={item.type} onChange={(e) => handleDynamicChange('productions_sci', idx, 'type', e.target.value)} className="w-full mt-1 bg-white border-none rounded-xl p-3 text-xs font-bold text-indigo-600">
                                            <option value="Publication_Inter">Publication Internationale</option>
                                            <option value="Communication_Inter">Communication Internationale</option>
                                            <option value="Communication_Nat">Communication Nationale</option>
                                            <option value="Livre">Livre / Chapitre</option>
                                            <option value="Rapport_Biblio">Rapport Bibliographique</option>
                                        </select>
                                    </div>
                                    <input placeholder="Titre" value={item.titre} onChange={(e) => handleDynamicChange('productions_sci', idx, 'titre', e.target.value)} className="md:col-span-2 bg-white border-none rounded-xl p-3 text-xs" />
                                    <input placeholder="Auteurs" value={item.auteurs} onChange={(e) => handleDynamicChange('productions_sci', idx, 'auteurs', e.target.value)} className="bg-white border-none rounded-xl p-3 text-xs" />
                                    <input placeholder="Revue ou Conférence" value={item.revue_ou_conference} onChange={(e) => handleDynamicChange('productions_sci', idx, 'revue_ou_conference', e.target.value)} className="bg-white border-none rounded-xl p-3 text-xs" />
                                    <div className="md:col-span-2">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Date de parution</label>
                                        <input type="date" value={item.date_parution} onChange={(e) => handleDynamicChange('productions_sci', idx, 'date_parution', e.target.value)} className="w-full mt-1 bg-white border-none rounded-xl p-3 text-xs" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'technique' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                            <div className="flex justify-between items-center mb-6 px-4">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Production Technologique</h3>
                                <button onClick={() => addRow('productions_tech', { type: 'Logiciel', intitule: '', description: '', reference: '' })} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all"><Plus size={20} /></button>
                            </div>
                            {formData.productions_tech.map((item, idx) => (
                                <div key={idx} className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative mb-6">
                                    <button onClick={() => removeRow('productions_tech', idx)} className="absolute top-6 right-6 text-slate-500"><Trash2 size={18} /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <select value={item.type} onChange={(e) => handleDynamicChange('productions_tech', idx, 'type', e.target.value)} className="bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-indigo-400">
                                            <option value="Logiciel">Logiciel</option>
                                            <option value="Produit">Produit</option>
                                            <option value="Brevet">Brevet</option>
                                            <option value="Prototype">Prototype</option>
                                        </select>
                                        <input placeholder="Référence (ex: Brevet n°)" value={item.reference} onChange={(e) => handleDynamicChange('productions_tech', idx, 'reference', e.target.value)} className="bg-slate-800 border-none rounded-xl p-3 text-xs" />
                                    </div>
                                    <input placeholder="Intitulé" value={item.intitule} onChange={(e) => handleDynamicChange('productions_tech', idx, 'intitule', e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-4 mb-4 text-sm font-bold" />
                                    <textarea placeholder="Description technique..." value={item.description} onChange={(e) => handleDynamicChange('productions_tech', idx, 'description', e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-4 text-xs min-h-[100px]" />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'formation' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                            <div className="flex justify-between items-center mb-8 px-4">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Encadrement</h3>
                                <button onClick={() => addRow('encadrements', { nom_etudiant: '', type_diplome: 'Doctorat', sujet: '', etablissement: '', etat_avancement: 'En cours' })} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><Users size={16}/> Ajouter</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.encadrements.map((item, idx) => (
                                    <div key={idx} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl relative space-y-3">
                                        <button onClick={() => removeRow('encadrements', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                                        <input placeholder="Nom de l'étudiant" value={item.nom_etudiant} onChange={(e) => handleDynamicChange('encadrements', idx, 'nom_etudiant', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" />
                                        <select value={item.type_diplome} onChange={(e) => handleDynamicChange('encadrements', idx, 'type_diplome', e.target.value)} className="w-full bg-slate-100 border-none rounded-xl p-2 text-[10px] font-black uppercase">
                                            <option value="Doctorat">Doctorat</option>
                                            <option value="Magister">Magister</option>
                                            <option value="Master">Master</option>
                                            <option value="Licence">Licence</option>
                                            <option value="PFE">PFE</option>
                                        </select>
                                        <input placeholder="Sujet" value={item.sujet} onChange={(e) => handleDynamicChange('encadrements', idx, 'sujet', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs" />
                                        <input placeholder="Établissement" value={item.etablissement} onChange={(e) => handleDynamicChange('encadrements', idx, 'etablissement', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs" />
                                        <select value={item.etat_avancement} onChange={(e) => handleDynamicChange('encadrements', idx, 'etat_avancement', e.target.value)} className={`w-full border-none rounded-xl p-2 text-xs font-bold ${item.etat_avancement === 'Soutenu' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <option value="En cours">En cours</option>
                                            <option value="Soutenu">Soutenu</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contraintes' && (
                        <div className="space-y-6">
                            {[
                                { id: 'difficultes_scientifiques', label: 'Difficultés Scientifiques' },
                                { id: 'difficultes_materielles', label: 'Difficultés Matérielles' },
                                { id: 'difficultes_humaines', label: 'Difficultés Humaines' },
                                { id: 'autres_resultats', label: 'Autres Résultats' }
                            ].map(diff => (
                                <div key={diff.id} className="bg-white p-8 rounded-[3rem] border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{diff.label}</label>
                                    <textarea value={formData[diff.id]} onChange={(e) => setFormData({...formData, [diff.id]: e.target.value})} className="w-full mt-2 bg-slate-50 border-none rounded-3xl p-6 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormulaireBilan;