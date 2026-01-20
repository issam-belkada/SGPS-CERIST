import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function GuestLayout() {
  const { user, token } = useStateContext();

  // Si l'utilisateur est déjà connecté, on redirige selon son rôle
  if (token) {
    // Logique de redirection par r
    //rôle
    switch (user.roles[0]) {
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "CS":
        return <Navigate to="/cs/sessions" replace />;
      case "ChefDivision":
        return <Navigate to="/division/propositions" replace />;
      case "ChefProjet":
        return <Navigate to="/chef-projet/pilotage" replace />;
      case "Chercheur":
        return <Navigate to="/chercheur/dashboard" replace />;
    }
  }

  // Si non connecté, on affiche les pages "invité" (Login, etc.)
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Éléments de design légers pour le fond du portail CERIST */}
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50"></div>

      <main className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Le logo ou le titre peut être mis ici ou directement dans la page Login */}
        <Outlet />
      </main>

      {/* Footer discret */}
      <footer className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
        CERIST • Research Management System • 2026
      </footer>
    </div>
  );
}