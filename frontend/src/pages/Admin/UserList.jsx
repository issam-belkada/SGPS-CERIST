import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axios";
import { 
  Edit, Trash2, UserPlus, Mail, Shield, 
  MapPin, Loader2, Search, Eye, AlertCircle 
} from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // État pour la modal de suppression
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axiosClient.get("/users")
      .then(({ data }) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const openDeleteModal = (user) => {
    setDeleteModal({ show: true, user });
  };

  const confirmDelete = () => {
    const { user } = deleteModal;
    setDeleteModal({ show: false, user: null });
    
    axiosClient.delete(`/users/${user.id}`)
      .then(() => fetchUsers())
      .catch(err => alert(err.response?.data?.error || "Erreur de suppression"));
  };

  const filteredUsers = users.filter(u => 
    `${u.nom} ${u.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleStyle = (roleName) => {
    const styles = {
      Admin: "bg-purple-100 text-purple-700 border-purple-200",
      ChefCS: "bg-amber-100 text-amber-700 border-amber-200",
      ChefDivision: "bg-blue-100 text-blue-700 border-blue-200",
      Chercheur: "bg-emerald-100 text-emerald-700 border-emerald-200"
    };
    return styles[roleName] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6 relative">
      
      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Supprimer le compte ?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer <span className="font-bold text-slate-800">{deleteModal.user?.nom} {deleteModal.user?.prenom}</span> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ show: false, user: null })}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Gestion des Chercheurs</h1>
          <p className="text-slate-500 text-sm">Consultez, modifiez ou ajoutez des membres au CERIST.</p>
        </div>
        <Link 
          to="/admin/users/create" 
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
        >
          <UserPlus size={18} />
          Nouveau Chercheur
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-500 font-medium">Récupération des données...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center w-16">Init</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Identité</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Contact & Grade</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Division</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const roleName = u.roles && u.roles.length > 0 ? u.roles[0].name : "Aucun";
                  return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200">
                          {u.nom.charAt(0)}{u.prenom.charAt(0)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{u.nom} {u.prenom}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Shield size={12} /> {u.grade}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-slate-600 flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" /> {u.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.division ? (
                          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <MapPin size={14} className="text-blue-500" /> {u.division.acronyme}
                          </span>
                        ) : (
                          <span className="text-xs italic text-slate-400">Aucune</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getRoleStyle(roleName)} uppercase tracking-tighter`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            to={`/admin/users/${u.id}`}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link 
                            to={`/admin/users/${u.id}/edit`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => openDeleteModal(u)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}