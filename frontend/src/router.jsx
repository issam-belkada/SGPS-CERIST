import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import GuestLayout from "./layouts/GuestLayout";
import AdminLayout from "./layouts/AdminLayout";
import CSLayout from "./layouts/CSLayout";
import ChefDivisionLayout from "./layouts/ChefDivisionLayout";
import ChercheurLayout from "./layouts/ChercheurLayout";

// Pages
import Login from "./pages/Auth/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserList from "./pages/Admin/UserList";
import UserForm from "./pages/Admin/UserForm";
import UserDetails from "./pages/Admin/UserDetails";
import DivisionList from "./pages/Admin/DivisionList";
import DivisionForm from "./pages/Admin/DivisionForm";
import DivisionDetails from "./pages/Admin/DivisionDetails";

// Pages Chercheur
import DashboardChercheur from "./pages/Chercheur/DashboardChercheur";
import MesTaches from "./pages/Chercheur/MesTaches";
import ProposerProjet from "./pages/Chercheur/ProposerProjet";
import ProjectDetails from "./pages/Chercheur/ProjectDetails";
import MaDivision from "./pages/Chercheur/MaDivision";
import MesProjets from "./pages/Chercheur/MesProjets";
import TacheDetails from "./pages/Chercheur/TacheDetails";
import LivrableModal from "./pages/Chercheur/LivrableModal";
import BilanPage from "./pages/Chercheur/BilanPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },
    ],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <UserList /> },
      { path: "users/create", element: <UserForm /> },
      { path: "users/:id", element: <UserDetails /> },
      { path: "users/:id/edit", element: <UserForm /> },
      { path: "divisions", element: <DivisionList /> },
      { path: "divisions/create", element: <DivisionForm /> },
      { path: "divisions/:id", element: <DivisionDetails /> },
      { path: "divisions/:id/edit", element: <DivisionForm /> },
    ],
  },

  {
    path: "/cs",
    element: <CSLayout />,
    children: [
      { index: true, element: <Navigate to="/cs/sessions" replace /> },
      { path: "sessions", element: <div>Sessions CS</div> },
      { path: "propositions-nationales", element: <div>Propositions Nationales</div> },
    ],
  },

  {
    path: "/division",
    element: <ChefDivisionLayout />,
    children: [
      { index: true, element: <Navigate to="/division/propositions" replace /> },
      { path: "propositions", element: <div>Propositions de la Division</div> },
    ],
  },

  {
    path: "/chercheur",
    element: <ChercheurLayout />,
    children: [
      { index: true, element: <Navigate to="/chercheur/dashboard" replace /> },
      { path: "dashboard", element: <DashboardChercheur /> },
      { path: "mes-projets", element: <MesProjets/>},
      { path: "projet/:id", element: <ProjectDetails /> },
      { path: "mes-taches", element: <MesTaches /> },
      { path: "proposer-projet", element: <ProposerProjet /> },
      { path: "ma-division", element: <MaDivision /> },
      { path: 'taches/:id', element: <TacheDetails /> },
        { path: "taches/:id/ajouter-livrable", element: <LivrableModal /> },
        { path: "projets/:id/bilan" , element: <BilanPage/> },
    ],
  },

  {
    path: "/unauthorized",
    element: (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-red-600 font-black text-5xl mb-4">403</div>
        <div className="font-bold text-slate-800 uppercase tracking-widest">Accès non autorisé</div>
      </div>
    ),
  },

  {
    path: "*",
    element: (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-slate-300 font-black text-5xl mb-4">404</div>
        <div className="font-bold text-slate-800 tracking-tight">Page introuvable</div>
      </div>
    ),
  },
]);

export default router;