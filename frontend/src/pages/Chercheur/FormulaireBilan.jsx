import React, { useState, useEffect } from 'react';
import { 
    Save, Send, Plus, Trash2, FileText, GraduationCap, 
    BarChart3, PlusCircle, Beaker, Cpu, AlertTriangle, Users 
} from 'lucide-react';
import axiosClient from "../../api/axios";

const FormulaireBilan = ({ projetId, initialData = null }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
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
        if (initialData) setFormData({ ...initialData });
    }, [initialData]);

    const addRow = (section, initialObj) => {
        setFormData(prev => ({ ...prev, [section]: [...(prev[section] || []), initialObj] }));
    };

    const removeRow = (section, index) => {
        setFormData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
    };

    const handleDynamicChange = (section, index, field, value) => {
        const newArray = [...formData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData(prev => ({ ...prev, [section]: newArray }));
    };

    const handleSave = async (etat = 'Brouillon') => {
        setLoading(true);
        try {
            await axiosClient.post(`/projets/${projetId}/bilan/sauvegarder`, { ...formData, etat_validation: etat });
            alert("Opération réussie !");
        } catch (error) {
            alert("Erreur lors de l'enregistrement");
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* STICKY HEADER */}
            <div className="bg-white/90 backdrop-blur-md sticky top-4 z-50 p-4 rounded-[2.5rem] border border-slate-100 shadow-xl flex justify-between items-center">
                <div className="flex items-center gap-4 ml-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><FileText size={24} /></div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900 uppercase">Bilan Annuel</h2>
                            <input type="number" value={formData.annee} onChange={(e) => setFormData({...formData, annee: e.target.value})} className="w-20 px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => handleSave('Brouillon')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2"><Save size={16} /> Brouillon</button>
                    <button onClick={() => handleSave('Soumis')} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100"><Send size={16} /> Soumettre</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* MENU LATÉRAL */}
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

                {/* CONTENU DYNAMIQUE */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* SECTION 1: GÉNÉRAL (Bilan Annuel) */}
                    {activeTab === 'general' && (
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Avancement Physique (%)</label>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mt-2">
                                    <input type="range" min="0" max="100" value={formData.avancement_physique} onChange={(e) => setFormData({...formData, avancement_physique: e.target.value})} className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none accent-indigo-600" />
                                    <span className="text-xl font-black text-indigo-600">{formData.avancement_physique}%</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Objectifs Réalisés & Collaborations</label>
                                <textarea value={formData.objectifs_realises} onChange={(e) => setFormData({...formData, objectifs_realises: e.target.value})} placeholder="Décrivez les travaux accomplis..." className="w-full p-6 bg-slate-50 border-none rounded-3xl mt-2 text-sm min-h-[150px]" />
                                <textarea value={formData.collaborations} onChange={(e) => setFormData({...formData, collaborations: e.target.value})} placeholder="Collaborations éventuelles..." className="w-full p-6 bg-slate-50 border-none rounded-3xl mt-4 text-sm min-h-[100px]" />
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: PRODUCTION SCIENTIFIQUE (Tous les champs de la migration) */}
                    {activeTab === 'scientifique' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black uppercase text-slate-800 tracking-tighter">Publications & Communications</h3>
                                <button onClick={() => addRow('productions_sci', { type: 'Publication_Inter', titre: '', auteurs: '', revue_ou_conference: '', date_parution: '' })} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><PlusCircle /></button>
                            </div>
                            {formData.productions_sci.map((item, idx) => (
                                <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] mb-4 relative grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button onClick={() => removeRow('productions_sci', idx)} className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md text-red-500"><Trash2 size={14}/></button>
                                    <div className="md:col-span-2">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Type de production</label>
                                        <select value={item.type} onChange={(e) => handleDynamicChange('productions_sci', idx, 'type', e.target.value)} className="w-full mt-1 bg-white border-none rounded-xl p-3 text-xs font-bold text-indigo-600">
                                            <option value="Publication_Inter">Publication Internationale</option>
                                            <option value="Communication_Inter">Communication Internationale</option>
                                            <option value="Communication_Nat">Communication Nationale</option>
                                            <option value="Livre">Livre / Chapitre</option>
                                            <option value="Rapport_Biblio">Rapport Bibliographique</option>
                                        </select>
                                    </div>
                                    <input placeholder="Titre complet" value={item.titre} onChange={(e) => handleDynamicChange('productions_sci', idx, 'titre', e.target.value)} className="md:col-span-2 bg-white border-none rounded-xl p-3 text-xs" />
                                    <input placeholder="Auteurs (séparés par virgule)" value={item.auteurs} onChange={(e) => handleDynamicChange('productions_sci', idx, 'auteurs', e.target.value)} className="bg-white border-none rounded-xl p-3 text-xs" />
                                    <input placeholder="Revue / Conférence" value={item.revue_ou_conference} onChange={(e) => handleDynamicChange('productions_sci', idx, 'revue_ou_conference', e.target.value)} className="bg-white border-none rounded-xl p-3 text-xs" />
                                    <div className="md:col-span-2">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Date de parution</label>
                                        <input type="date" value={item.date_parution} onChange={(e) => handleDynamicChange('productions_sci', idx, 'date_parution', e.target.value)} className="w-full mt-1 bg-white border-none rounded-xl p-3 text-xs" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SECTION 3: PRODUCTION TECHNIQUE (Logiciel, Brevet, etc.) */}
                    {activeTab === 'technique' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6 px-4">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Production Technologique</h3>
                                <button onClick={() => addRow('productions_tech', { type: 'Logiciel', intitule: '', description: '', reference: '' })} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all"><Plus size={20} /></button>
                            </div>
                            {formData.productions_tech.map((item, idx) => (
                                <div key={idx} className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative mb-6">
                                    <button onClick={() => removeRow('productions_tech', idx)} className="absolute top-6 right-6 text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <select value={item.type} onChange={(e) => handleDynamicChange('productions_tech', idx, 'type', e.target.value)} className="bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-500">
                                            <option value="Logiciel">Logiciel</option>
                                            <option value="Produit">Produit</option>
                                            <option value="Brevet">Brevet</option>
                                            <option value="Prototype">Prototype</option>
                                        </select>
                                        <input placeholder="Référence / N° Version" value={item.reference} onChange={(e) => handleDynamicChange('productions_tech', idx, 'reference', e.target.value)} className="bg-slate-800 border-none rounded-xl p-3 text-xs text-white" />
                                    </div>
                                    <input placeholder="Intitulé du produit" value={item.intitule} onChange={(e) => handleDynamicChange('productions_tech', idx, 'intitule', e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-4 mb-4 text-sm font-bold text-white" />
                                    <textarea placeholder="Description technique..." value={item.description} onChange={(e) => handleDynamicChange('productions_tech', idx, 'description', e.target.value)} className="w-full bg-slate-800 border-none rounded-xl p-4 text-xs text-slate-300 min-h-[100px]" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SECTION 4: ENCADREMENT (Tous les champs de la migration) */}
                    {activeTab === 'formation' && (
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-8 px-4">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Encadrement d'étudiants</h3>
                                <button onClick={() => addRow('encadrements', { nom_etudiant: '', type_diplome: 'Doctorat', sujet: '', etablissement: '', etat_avancement: 'En cours' })} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><Users size={16}/> Ajouter</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {formData.encadrements.map((item, idx) => (
                                    <div key={idx} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl relative space-y-3">
                                        <button onClick={() => removeRow('encadrements', idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Étudiant & Diplôme</label>
                                            <input placeholder="Nom et Prénom" value={item.nom_etudiant} onChange={(e) => handleDynamicChange('encadrements', idx, 'nom_etudiant', e.target.value)} className="w-full mt-1 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" />
                                            <select value={item.type_diplome} onChange={(e) => handleDynamicChange('encadrements', idx, 'type_diplome', e.target.value)} className="w-full mt-2 bg-slate-100 border-none rounded-xl p-2 text-[10px] font-black uppercase">
                                                <option value="Doctorat">Doctorat</option>
                                                <option value="Master">Master</option>
                                                <option value="Magister">Magister</option>
                                                <option value="PFE">PFE</option>
                                                <option value="Licence">Licence</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Sujet & Établissement</label>
                                            <input placeholder="Sujet de recherche" value={item.sujet} onChange={(e) => handleDynamicChange('encadrements', idx, 'sujet', e.target.value)} className="w-full mt-1 bg-slate-50 border-none rounded-xl p-3 text-xs" />
                                            <input placeholder="Université / École" value={item.etablissement} onChange={(e) => handleDynamicChange('encadrements', idx, 'etablissement', e.target.value)} className="w-full mt-2 bg-slate-50 border-none rounded-xl p-3 text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">État d'avancement</label>
                                            <select value={item.etat_avancement} onChange={(e) => handleDynamicChange('encadrements', idx, 'etat_avancement', e.target.value)} className={`w-full mt-1 border-none rounded-xl p-2 text-xs font-bold ${item.etat_avancement === 'Soutenu' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                <option value="En cours">En cours</option>
                                                <option value="Soutenu">Soutenu</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 5: DIFFICULTÉS */}
                    {activeTab === 'contraintes' && (
                        <div className="space-y-6">
                            {[
                                { id: 'difficultes_scientifiques', label: 'Difficultés Scientifiques' },
                                { id: 'difficultes_materielles', label: 'Difficultés Matérielles' },
                                { id: 'difficultes_humaines', label: 'Difficultés Humaines' },
                                { id: 'autres_resultats', label: 'Autres Résultats Notables' }
                            ].map(diff => (
                                <div key={diff.id} className="bg-white p-8 rounded-[3rem] border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{diff.label}</label>
                                    <textarea value={formData[diff.id]} onChange={(e) => setFormData({...formData, [diff.id]: e.target.value})} placeholder={`Saisir les détails concernant les ${diff.label.toLowerCase()}...`} className="w-full mt-2 bg-slate-50 border-none rounded-3xl p-6 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500" />
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