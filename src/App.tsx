
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { useLanguage } from "./hooks/useLanguage";
import { LoadingScreen } from "./components/ui/loading-screen";

// Lazy-loaded pages
const AppLayout = React.lazy(() => import("./components/layout/AppLayout"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const UsersManager = React.lazy(() => import("./pages/UsersManager"));
const Operations = React.lazy(() => import("./pages/Operations"));
const DistributorUsers = React.lazy(() => import("./pages/DistributorUsers"));
const DistributorOperations = React.lazy(() => import("./pages/DistributorOperations"));
const Distributors = React.lazy(() => import("./pages/Distributors"));
const Login = React.lazy(() => import("./pages/Login"));
const TwoFactorAuth = React.lazy(() => import("./pages/TwoFactorAuth"));
const ServerApiData = React.lazy(() => import("./pages/ServerApiData"));
const ServerStorage = React.lazy(() => import("./pages/ServerStorage"));
const Discounts = React.lazy(() => import("./pages/Discounts"));
const GroupsManagement = React.lazy(() => import("./pages/GroupsManagement"));
const ToolSettings = React.lazy(() => import("./pages/ToolSettings"));
const ToolUpdate = React.lazy(() => import("./pages/ToolUpdate"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Settings = React.lazy(() => import("./pages/Settings"));
const WebSettings = React.lazy(() => import("./pages/WebSettings"));
const EditMyProfile = React.lazy(() => import("./pages/EditMyProfile"));
const MyCertFiles = React.lazy(() => import("./pages/MyCertFiles"));

export default function App() {
  const { isRTL } = useLanguage();

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background dark:bg-gray-950">
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/two-factor" element={<TwoFactorAuth />} />
              
              {/* Protected routes - accessible by any authenticated user */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Suspense fallback={<LoadingScreen />}>
                        <Routes>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="operations" element={<Operations />} />
                          <Route path="profile" element={<EditMyProfile />} />
                          <Route path="my-files" element={<MyCertFiles />} />
                          <Route path="settings" element={<Settings />} />
                          
                          {/* Admin-only routes */}
                          <Route
                            path="users"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <UsersManager />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="distributors"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <Distributors />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="server-api"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <ServerApiData />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="server-storage"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <ServerStorage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="discounts"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <Discounts />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="groups"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <GroupsManagement />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="tool-settings"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <ToolSettings />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="tool-update"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <ToolUpdate />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="web-settings/*"
                            element={
                              <ProtectedRoute allowedRoles={["admin"]}>
                                <WebSettings />
                              </ProtectedRoute>
                            }
                          />
                          
                          {/* Distributor-only routes */}
                          <Route
                            path="distributor-users"
                            element={
                              <ProtectedRoute allowedRoles={["distributor"]}>
                                <DistributorUsers />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="distributor-operations"
                            element={
                              <ProtectedRoute allowedRoles={["distributor"]}>
                                <DistributorOperations />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                      </Suspense>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}
