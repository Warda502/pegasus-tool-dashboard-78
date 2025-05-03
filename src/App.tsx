
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersManager from "./pages/UsersManager";
import Operations from "./pages/Operations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import { LanguageProvider } from "./hooks/useLanguage";
import EditMyProfile from "./pages/EditMyProfile";
import { AuthProvider } from "./hooks/auth/AuthContext";
import { DataProvider } from "./hooks/data/DataContext";
import ServerApiData from "./pages/ServerApiData";
import ServerStorage from "./pages/ServerStorage";
import MyCertFiles from "./pages/MyCertFiles";
import Discounts from "./pages/Discounts";
import GroupsManagement from "./pages/GroupsManagement";
import ToolUpdate from "./pages/ToolUpdate";
import ToolSettings from "./pages/ToolSettings";

// Configure React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout><Dashboard /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/users-manager" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AppLayout><UsersManager /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/operations" element={
                  <ProtectedRoute>
                    <AppLayout><Operations /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <AppLayout><Settings /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/edit-profile" element={
                  <ProtectedRoute>
                    <AppLayout><EditMyProfile /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/server-api-data" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AppLayout><ServerApiData /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/server-storage" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AppLayout><ServerStorage /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/my-cert-files" element={
                  <ProtectedRoute>
                    <AppLayout><MyCertFiles /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/discounts" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AppLayout><Discounts /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/groups-management" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AppLayout><GroupsManagement /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/tool-update" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AppLayout><ToolUpdate /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/tool-settings" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AppLayout><ToolSettings /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
