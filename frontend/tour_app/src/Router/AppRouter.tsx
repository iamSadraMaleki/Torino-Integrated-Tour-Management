import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FirstPage from '../Pages/mainpage/FirstPage';
import { AuthProvider, useAuth } from '../Context/AuthContext';
import AuthPage from '../pages/authpage/AuthPage';

// ========== Lazy Loading برای همه داشبوردها ==========
const UserDashboard = lazy(() => import('../Pages/user/UserDashboard'));
const CeoDashboard = lazy(() => import('../Pages/ceo/CeoDashboard'));
const AdminDashboard = lazy(() => import('../Pages/admin/AdminDashboard'));

// ========== کامپوننت لودینگ ==========
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #e2e8f0',
      borderTopColor: '#0d9488',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}></div>
  </div>
);

// ========== Protected Route Component ==========
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'ceo') return <Navigate to="/ceo/dashboard" replace />;
    if (user.role === 'admin' || user.role === 'superadmin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
};

// ========== Main Router ==========
const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* صفحات عمومی */}
            <Route path="/" element={<FirstPage />} />
            <Route path="/home" element={<FirstPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* داشبورد کاربر معمولی */}
            <Route 
              path="/user/dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* داشبورد مدیر آژانس (CEO) */}
            <Route 
              path="/ceo/dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['ceo']}>
                  <CeoDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* داشبورد ادمین */}
            <Route 
              path="/admin/dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* ریدایرکت */}
            <Route path="/dashboard/*" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;