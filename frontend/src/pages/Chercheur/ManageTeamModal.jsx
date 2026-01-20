import React, { useState, useEffect } from 'react';
import { X, Users, Search, UserPlus, UserMinus, Loader2, Check } from 'lucide-react';
import axiosClient from '../../api/axios';

export default function ManageTeamModal({ projet, onClose, onRefresh }) {
    const [search, setSearch] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    // Récupérer tous les chercheurs pour la recherche
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axiosClient.get('/users/chercheurs'); // Endpoint à créer
                setAllUsers(data);
            } catch (err) { console.error(err); }
        };
        fetchUsers();
    }, []);

    const isMember = (userId) => projet.membres.some(m => m.id === userId);

    const toggleMember = async (userId) => {
        setActionLoading(userId);
        try {
            if (isMember(userId)) {
                await axiosClient.post(`/projets/${projet.id}/remove-member`, { user_id: userId });
            } else {
                await axiosClient.post(`/projets/${projet.id}/add-member`, { user_id: userId });
            }
            onRefresh(); // Refresh le projet pour mettre à jour la liste des membres
        } catch (err) {
            alert("Erreur lors de la modification de l'équipe");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = allUsers.filter(u => 
        u.nom.toLowerCase().includes(search.toLowerCase()) || 
        u.prenom.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                            <Users size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase">Gérer l'Équipe</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full shadow-sm"><X size={20} /></button>
                </div>

                <div className="p-8">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un chercheur par nom..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-indigo-600 border border-slate-100">
                                        {user.prenom[0]}{user.nom[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{user.prenom} {user.nom}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{user.specialite || 'Chercheur'}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => toggleMember(user.id)}
                                    disabled={actionLoading === user.id}
                                    className={`p-3 rounded-xl transition-all ${
                                        isMember(user.id) 
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                    }`}
                                >
                                    {actionLoading === user.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : isMember(user.id) ? (
                                        <UserMinus size={18} />
                                    ) : (
                                        <UserPlus size={18} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}