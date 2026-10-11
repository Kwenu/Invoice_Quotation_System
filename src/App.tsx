import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth } from "./components/layout/RequireAuth";
import { ClientDetail } from "./pages/ClientDetail";
import { Clients } from "./pages/Clients";
import { Dashboard } from "./pages/Dashboard";
import { DocumentEditor } from "./pages/DocumentEditor";
import { Documents } from "./pages/Documents";
import { DocumentView } from "./pages/DocumentView";
import { Login } from "./pages/Login";
import { Maintenance } from "./pages/Maintenance";
import { Team } from "./pages/Team";
import { TeamMemberDetail } from "./pages/TeamMemberDetail";
import { NewDocument } from "./pages/NewDocument";
import { Settings } from "./pages/Settings";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),

    children: [
      { index: true, element: <Dashboard /> },
      { path: "documents", element: <Documents /> },
      { path: "documents/new", element: <NewDocument /> },
      { path: "documents/new/:division/:type", element: <DocumentEditor /> },
      { path: "documents/:id", element: <DocumentView /> },
      { path: "documents/:id/edit", element: <DocumentEditor /> },
      { path: "clients", element: <Clients /> },
      { path: "clients/:id", element: <ClientDetail /> },
      { path: "maintenance", element: <Maintenance /> },
      { path: "team", element: <Team /> },
      { path: "team/:id", element: <TeamMemberDetail /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <DataProvider>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" richColors closeButton />
        </DataProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
