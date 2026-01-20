import React, { useState, useEffect } from 'react';
import { 
    Save, Send, Plus, Trash2, FileText, GraduationCap, 
    BarChart3, PlusCircle, Beaker, Construction,
    Cpu, MessageSquare, AlertTriangle, Calendar, Users
} from 'lucide-react';
import axiosClient from "../../api/axios";

const FormulaireBilan = ({ projetId, initialData = null }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        annee: '',
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
            setFormData({
                ...initialData,
                productions_sci: initialData.productions_sci || [],
                productions_tech: initialData.productions_tech || [],
                encadrements: initialData.encadrements || []
            });
        }
    }, [initialData]);

    const addRow = (section, initialObj) => {
        setFormData(prev => ({ ...prev, [section]: [...(prev[section] || []), initialObj] }));
    };

    const removeRow = (section, index) => {
        setFormData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
    };

    const handleDynamicChange = (section, index, field, value) => {
        const newArray = [...formData[section]];
        newArray[index][field] = value;
        setFormData(prev => ({ ...prev, [section]: newArray }));
    };

    const handleSave = async (etat = 'Brouillon') => {
        if (!formData.annee) {
            alert("Veuillez saisir l'année du bilan.");
            return;
        }
        setLoading(true);
        try {
            await axiosClient.post(`/projets/${projetId}/bilan/sauvegarder`, { ...formData, etat_validation: etat });
            alert(etat === 'Soumis' ? "Bilan soumis avec succès !" : "Brouillon enregistré.");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'opération.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            
            {/* STICKY HEADER ACTIONS */}
            <div className="bg-white/90 backdrop-blur-md sticky top-4 z-50 p-4 rounded-[2.5rem] border border-slate-100 shadow-xl flex justify-between items-center">
                <div className="flex items-center gap-4 ml-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <FileText size={24} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Bilan Annuel</h2>
                            {/* CHAMP ANNEE MANUEL */}
                            <input 
                                type="number" 
                                placeholder="AAAA"
                                value={formData.annee}
                                onChange={(e) => setFormData({...formData, annee: e.target.value})}
                                className="w-20 px-2 py-1 bg-slate-100 border-none rounded-lg text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Édition en cours
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => handleSave('Brouillon')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Save size={16} /> Sauvegarder
                    </button>
                    <button onClick={() => handleSave('Soumis')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Send size={16} /> Soumettre le bilan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* NAVIGATION (SIDEBAR) */}
                <div className="lg:col-span-1 space-y-3">
                    {[
                        { id: 'general', label: 'Progrès & Objectifs', icon: <BarChart3 size={18}/> },
                        { id: 'scientifique', label: 'Prod. Scientifique', icon: <Beaker size={18}/> },
                        { id: 'technique', label: 'Prod. Technique', icon: <Cpu size={18}/> },
                        { id: 'formation', label: 'Encadrement', icon: <GraduationCap size={18}/> },
                        { id: 'contraintes', label: 'Difficultés', icon: <AlertTriangle size={18}/> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 border ${
                                activeTab === tab.id ? 'bg-white border-white shadow-xl text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}>
                            <span className={`${activeTab === tab.id ? 'scale-125' : ''} transition-transform`}>{tab.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* CONTENU DROITE */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-right-4">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Avancement Physique du projet</label>
                                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem]">
                                    <input type="range" name="avancement_physique" value={formData.avancement_physique} onChange={(e) => setFormData({...formData, avancement_physique: e.target.value})} className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    <span className="text-2xl font-black text-indigo-600 min-w-[60px]">{formData.avancement_physique}%</span>
                                </div>
                            </div>
                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description des Objectifs Réalisés</label>
                                <textarea value={formData.objectifs_realises} onChange={(e) => setFormData({...formData, objectifs_realises: e.target.value})} placeholder="Détaillez les travaux accomplis cette année..." className="w-full p-8 bg-slate-50 border-none rounded-[2.5rem] focus:ring-2 focus:ring-indigo-500 min-h-[200px] text-slate-600 leading-relaxed" />
                            </div>
                        </div>
                    )}

                    {/* TAB: SCIENTIFIQUE */}
                    {activeTab === 'scientifique' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                                <div className="flex justify-between items-center mb-8 px-4">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Publications & Communications</h3>
                                    <button onClick={() => addRow('productions_sci', { type: 'Publication_Inter', titre: '', auteurs: '', revue_ou_conference: '', date_parution: '' })} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><PlusCircle size={24} /></button>
                                </div>
                                <div className="space-y-4">
                                    {formData.productions_sci.map((item, idx) => (
                                        <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 relative group">
                                            <button onClick={() => removeRow('productions_sci', idx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Type de production</label>
                                                    <select value={item.type} onChange={(e) => handleDynamicChange('productions_sci', idx, 'type', e.target.value)} className="w-full bg-white border-none rounded-xl text-[10px] font-black uppercase text-indigo-600 focus:ring-2 focus:ring-indigo-500">
                                                        <option value="Publication_Inter">Publication Internationale</option>
                                                        <option value="Communication_Inter">Communication Internationale</option>
                                                        <option value="Communication_Nat">Communication Nationale</option>
                                                        <option value="Livre">Livre / Chapitre</option>
                                                        <option value="Rapport_Biblio">Rapport Bibliographique</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Date de parution</label>
                                                    <input type="date" value={item.date_parution} onChange={(e) => handleDynamicChange('productions_sci', idx, 'date_parution', e.target.value)} className="w-full bg-white border-none rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500" />
                                                </div>
                                            </div>
                                            <input placeholder="Titre complet de la production" value={item.titre} onChange={(e) => handleDynamicChange('productions_sci', idx, 'titre', e.target.value)} className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input placeholder="Auteurs (ex: Nom A., Nom B.)" value={item.auteurs} onChange={(e) => handleDynamicChange('productions_sci', idx, 'auteurs', e.target.value)} className="bg-white border-none rounded-xl p-4 text-xs font-bold text-slate-600" />
                                                <input placeholder="Nom de la revue ou conférence" value={item.revue_ou_conference} onChange={(e) => handleDynamicChange('productions_sci', idx, 'revue_ou_conference', e.target.value)} className="bg-white border-none rounded-xl p-4 text-xs font-bold text-slate-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: TECHNIQUE */}
                    {activeTab === 'technique' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-center mb-8 px-4">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Production Technologique</h3>
                                <button onClick={() => addRow('productions_tech', { type: 'Logiciel', intitule: '', description: '', reference: '' })} className="p-3 bg-indigo-900 text-white rounded-2xl hover:bg-indigo-700 transition-all"><Plus size={24} /></button>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {formData.productions_tech.map((item, idx) => (
                                    <div key={idx} className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative">
                                        <button onClick={() => removeRow('productions_tech', idx)} className="absolute top-6 right-6 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                                        <div className="flex flex-wrap gap-4 mb-6">
                                            {['Logiciel', 'Produit', 'Brevet', 'Prototype'].map(t => (
                                                <button key={t} onClick={() => handleDynamicChange('productions_tech', idx, 'type', t)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${item.type === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                        <input placeholder="Intitulé du produit ou logiciel" value={item.intitule} onChange={(e) => handleDynamicChange('productions_tech', idx, 'intitule', e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-4 mb-4 text-sm font-bold text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500" />
                                        <textarea placeholder="Description technique..." value={item.description} onChange={(e) => handleDynamicChange('productions_tech', idx, 'description', e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-4 mb-4 text-xs text-slate-300 min-h-[100px]" />
                                        <input placeholder="Référence (N° Brevet, Version, etc.)" value={item.reference} onChange={(e) => handleDynamicChange('productions_tech', idx, 'reference', e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-4 text-xs font-mono text-indigo-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: FORMATION */}
                    {activeTab === 'formation' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-center mb-8 px-4">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Encadrement d'Étudiants</h3>
                                <button onClick={() => addRow('encadrements', { nom_etudiant: '', type_diplome: 'Master', sujet: '', etablissement: '', etat_avancement: 'En cours' })} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100"><Users size={16}/> Ajouter un étudiant</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.encadrements.map((item, idx) => (
                                    <div key={idx} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 relative">
                                        <button onClick={() => removeRow('encadrements', idx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">ST</div>
                                            <select value={item.type_diplome} onChange={(e) => handleDynamicChange('encadrements', idx, 'type_diplome', e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase text-indigo-600 focus:ring-0">
                                                <option>Doctorat</option><option>Master</option><option>PFE</option><option>Licence</option>
                                            </select>
                                        </div>
                                        <input placeholder="Nom & Prénom de l'étudiant" value={item.nom_etudiant} onChange={(e) => handleDynamicChange('encadrements', idx, 'nom_etudiant', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-800" />
                                        <input placeholder="Sujet du mémoire / thèse" value={item.sujet} onChange={(e) => handleDynamicChange('encadrements', idx, 'sujet', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs text-slate-600" />
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">État :</span>
                                            <div className="flex gap-2">
                                                {['En cours', 'Soutenu'].map(s => (
                                                    <button key={s} onClick={() => handleDynamicChange('encadrements', idx, 'etat_avancement', s)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${item.etat_avancement === s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: CONTRAINTES */}
                    {activeTab === 'contraintes' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            {[
                                { id: 'difficultes_scientifiques', label: 'Difficultés Scientifiques', icon: <Beaker size={20}/>, color: 'indigo' },
                                { id: 'difficultes_materielles', label: 'Difficultés Matérielles', icon: <Cpu size={20}/>, color: 'amber' },
                                { id: 'difficultes_humaines', label: 'Difficultés Humaines', icon: <Users size={20}/>, color: 'rose' }
                            ].map(diff => (
                                <div key={diff.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex gap-6">
                                    <div className={`w-14 h-14 bg-${diff.color}-50 text-${diff.color}-600 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm`}>{diff.icon}</div>
                                    <div className="flex-1 space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{diff.label}</label>
                                        <textarea value={formData[diff.id]} onChange={(e) => setFormData({...formData, [diff.id]: e.target.value})} placeholder={`Quels obstacles ${diff.color === 'rose' ? 'humains' : 'techniques'} avez-vous rencontré ?`} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm text-slate-600 focus:ring-1 focus:ring-slate-200" rows="3" />
                                    </div>
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