import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import UsersManager from "./pages/UsersManager";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import EditMyProfile from "./pages/EditMyProfile";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Distributors from "./pages/Distributors";
import DistributorUsers from "./pages/DistributorUsers";
import DistributorOperations from "./pages/DistributorOperations";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/2fa" element={
            <ProtectedRoute>
              <TwoFactorAuth />
            </ProtectedRoute>
          } />
          
          {/* Main layout routes */}
          <Route element={<AppLayout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Operations */}
            <Route path="/operations" element={
              <ProtectedRoute>
                <Operations />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/users" element={
              <ProtectedRoute requireAdmin>
                <UsersManager />
              </ProtectedRoute>
            } />
            
            <Route path="/distributors" element={
              <ProtectedRoute requireAdmin>
                <Distributors />
              </ProtectedRoute>
            } />
            
            {/* Distributor Routes */}
            <Route path="/distributor-users" element={
              <ProtectedRoute>
                <DistributorUsers />
              </ProtectedRoute>
            } />
            
            <Route path="/distributor-operations" element={
              <ProtectedRoute>
                <DistributorOperations />
              </ProtectedRoute>
            } />
            
            {/* User Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <EditMyProfile />
              </ProtectedRoute>
            } />
            
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
