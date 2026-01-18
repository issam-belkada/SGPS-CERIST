import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axios";
import { Save, ArrowLeft, Building2, Tag, AlignLeft, Loader2 } from "lucide-react";

export default function DivisionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // On garde la structure de l'objet cohérente avec le backend
  const [division, setDivision] = useState({ 
    nom: "", 
    acronyme: "", 
    description: "",
    // chef_id n'est pas modifié ici pour respecter votre règle 
    // "le chef se gère dans les détails"
  });

  useEffect(() => {
    if (id) {
      setFetching(true);
      axiosClient.get(`/divisions/${id}`)
        .then(({ data }) => {
          setDivision({
            nom: data.nom,
            acronyme: data.acronyme,
            description: data.description || ""
          });
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [id]);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    const promise = id 
      ? axiosClient.put(`/divisions/${id}`, division) 
      : axiosClient.post("/divisions", division);

    promise
      .then(() => {
        navigate("/admin/divisions");
      })
      .catch(err => {
        setLoading(false);
        if (err.response?.status === 422) {
          setErrors(err.response.data.errors);
        }
      });
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/admin/divisions" className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 border border-transparent hover:border-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {id ? "Modifier la division" : "Nouvelle Division"}
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Configuration de la structure</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm space-y-6">
        {/* Nom complet */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Building2 size={16} className="text-slate-400" /> Nom complet de la division
          </label>
          <input 
            value={division.nom}
            onChange={e => setDivision({...division, nom: e.target.value})}
            className={`w-full px-4 py-3 bg-slate-50 border ${errors?.nom ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
            placeholder="Ex: Division des Systèmes d'Information"
          />
          {errors?.nom && <p className="text-red-500 text-xs font-bold px-1">{errors.nom[0]}</p>}
        </div>

        {/* Acronyme */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Tag size={16} className="text-slate-400" /> Acronyme
          </label>
          <input 
            value={division.acronyme}
            onChange={e => setDivision({...division, acronyme: e.target.value})}
            className={`w-full px-4 py-3 bg-slate-50 border ${errors?.acronyme ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
            placeholder="Ex: DSI"
          />
          {errors?.acronyme && <p className="text-red-500 text-xs font-bold px-1">{errors.acronyme[0]}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <AlignLeft size={16} className="text-slate-400" /> Description (Optionnel)
          </label>
          <textarea 
            rows="4"
            value={division.description || ""}
            onChange={e => setDivision({...division, description: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
            placeholder="Décrivez les missions de cette division..."
          />
        </div>

        <div className="pt-4">
          <button 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {id ? "Enregistrer les modifications" : "Créer la division"}
          </button>
        </div>
      </form>
    </div>
  );
}