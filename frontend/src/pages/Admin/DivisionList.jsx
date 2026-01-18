import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axios";
import { 
  Building2, Plus, Search, Edit, Trash2, 
  Users, Loader2, Eye, Crown 
} from "lucide-react";

export default function DivisionList() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = () => {
    setLoading(true);
    axiosClient.get("/divisions")
      .then(({ data }) => {
        setDivisions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const deleteDivision = (id) => {
    if (!window.confirm("Supprimer cette division ? (Elle doit être vide)")) return;
    axiosClient.delete(`/divisions/${id}`)
      .then(() => fetchDivisions())
      .catch(err => alert(err.response?.data?.error || "Erreur lors de la suppression"));
  };

  const filtered = divisions.filter(d => 
    d.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.acronyme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Divisions de Recherche</h1>
          <p className="text-slate-500 text-sm">Organisez les structures et laboratoires du centre.</p>
        </div>
        <Link to="/admin/divisions/create" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100">
          <Plus size={18} /> Nouvelle Division
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une division (DSI, DTISI...)"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Chargement des divisions...</p>
          </div>
        ) : filtered.map(d => (
          <div key={d.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-1">
                  <Link to={`/admin/divisions/${d.id}`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Eye size={18}/></Link>
                  <Link to={`/admin/divisions/${d.id}/edit`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={18}/></Link>
                  <button onClick={() => deleteDivision(d.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              
              <h3 className="text-lg font-black text-slate-800 leading-tight">{d.nom}</h3>
              <span className="inline-block mt-1 text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">{d.acronyme}</span>

              {/* SECTION RESPONSABLE AJOUTÉE */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Crown size={10} /> Responsable
                </p>
                {d.chef ? (
                  <p className="text-sm font-bold text-slate-700 truncate">
                    {d.chef.nom} {d.chef.prenom}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic">Non assigné</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Users size={16} />
                <span>{d.users_count || 0} Chercheurs</span>
              </div>
              <Link to={`/admin/divisions/${d.id}`} className="text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">Voir détails</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}