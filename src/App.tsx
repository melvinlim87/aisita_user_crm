import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import getRoutes from '@/routes';
import { CustomRouteObject } from '@/types/common/routes';
import CircuitBackground from './components/common/CircuitBackground';
import MainLayout from './components/layout/MainLayout';
import { clearAuthData } from '@/hooks/useAuth';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Clear authentication data before redirecting
    clearAuthData();
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const routes = getRoutes();
  const publicRoutes = routes.filter(route => !route.protected);
  const protectedRoutes = routes.filter(route => route.protected);

  return (
    <AuthProvider>
      <Router>
        <CircuitBackground />
        <Suspense fallback={
          <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
          </div>
        }>
          <Routes>
            {/* Public routes without MainLayout */}
            {publicRoutes.map((route: CustomRouteObject) => {
              if (!route.component) return null;
              const RouteComponent = route.component;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<RouteComponent />}
                />
              );
            })}
            
            {/* Protected routes with MainLayout */}
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {protectedRoutes.map((route: CustomRouteObject) => {
                if (!route.component) return null;
                const RouteComponent = route.component;
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<RouteComponent />}
                  />
                );
              })}
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;