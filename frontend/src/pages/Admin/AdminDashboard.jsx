import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axios";
import { 
  Users, Building2, ShieldAlert, UserCheck, 
  Activity, Loader2, ArrowUpRight, ChevronRight,
  TrendingUp, Calendar, RefreshCw
} from "lucide-react";

// Importations Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Filler, Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    setLoading(true);
    axiosClient.get("/admin/statistics")
      .then(({ data }) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur dashboard:", err);
        setLoading(false);
      });
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Synchronisation...</p>
    </div>
  );

  // Configuration du graphique avec les données de l'API
  const chartData = {
    labels: stats?.chart?.labels || [],
    datasets: [
      {
        fill: true,
        label: 'Nouveaux Chercheurs',
        data: stats?.chart?.datasets || [],
        borderColor: '#6366f1',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          return gradient;
        },
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
      y: { border: { dash: [4, 4] }, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* SECTION 1: HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard.</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Calendar size={16} /> Statistiques du centre au {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={18} /> Actualiser
        </button>
      </div>

      {/* SECTION 2: CARTES DE STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Chercheurs", val: stats?.totalUsers, icon: <Users size={22}/>, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Divisions", val: stats?.totalDivisions, icon: <Building2 size={22}/>, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Admins", val: stats?.adminsCount, icon: <UserCheck size={22}/>, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Projets", val: "24", icon: <TrendingUp size={22}/>, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((c, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
            <div className={`w-12 h-12 ${c.bg} ${c.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] mb-1">{c.label}</p>
            <div className="flex items-center justify-between">
               <h3 className="text-3xl font-black text-slate-900">{c.val}</h3>
               <div className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black">+12%</div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: GRAPHIQUE ET RÉCENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRAPHIQUE D'ACTIVITÉ */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-xl text-white">
                <Activity size={20} />
              </div>
              Croissance des effectifs
            </h3>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs bg-indigo-50 px-4 py-2 rounded-2xl">
              Données temps réel
            </div>
          </div>
          
          <div className="flex-1 h-72 min-h-[300px]">
             <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* NOUVEAUX INSCRITS */}
        <div className="bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">Nouveaux arrivants</h3>
            <Link to="/admin/users" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors">
              <ChevronRight size={20} />
            </Link>
          </div>
          
          <div className="space-y-6">
            {stats?.recentUsers?.map((u, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                  {u.nom.charAt(0)}{u.prenom.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate leading-none">
                    {u.nom} {u.prenom}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight truncate">
                    {u.grade || "Chercheur"} • {u.division?.acronyme || "Sans division"}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors"></div>
              </div>
            ))}
          </div>

          <Link 
            to="/admin/users/create" 
            className="mt-10 w-full flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Inscrire un membre
          </Link>
        </div>
      </div>
    </div>
  );
}