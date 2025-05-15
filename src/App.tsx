
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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
          
          {/* Main layout routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Outlet />
              </AppLayout>
            </ProtectedRoute>
          }>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Operations */}
            <Route path="/operations" element={<Operations />} />

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
            <Route path="/distributor-users" element={<DistributorUsers />} />
            <Route path="/distributor-operations" element={<DistributorOperations />} />
            
            {/* User Routes */}
            <Route path="/profile" element={<EditMyProfile />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
          </Route>

          {/* Standalone 2FA page (outside main layout) */}
          <Route path="/2fa-setup" element={
            <ProtectedRoute>
              <TwoFactorAuth />
            </ProtectedRoute>
          } />
          
          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
