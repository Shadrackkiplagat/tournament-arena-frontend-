import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fixtures from './pages/Fixtures';
import Sidebar from './components/Sidebar';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Fans from './pages/Fans';
import SettingsPage from './pages/SettingsPage';
// ✅ REMOVED: import { Settings } from 'lucide-react'; 
// This was causing the "unused variable" error

function ProtectedRoute({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-900 min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fixtures"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Fixtures />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Teams />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Players />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fans"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Fans />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;