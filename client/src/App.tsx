// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PenilaianListPage from './pages/PenilaianListPage';
import PenilaianDetailPage from './pages/PenilaianDetailPage';
import PenilaianFormPage from './pages/PenilaianFormPage';
import InstrumenPage from './pages/InstrumenPage';
import RekapPage from './pages/RekapPage';
import PrintPage from './pages/PrintPage';
import SekolahBuktiPage from './pages/SekolahBuktiPage';
import UserManagementPage from './pages/UserManagementPage';
import { can } from './lib/rbac';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ children, check }: { children: React.ReactNode; check: (role: any) => boolean }) {
  const { user } = useAuth();
  if (!user || !check(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/print/:id" element={<PrintPage />} />
      <Route path="/bukti/:id" element={<SekolahBuktiPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />

        {/* Penilaian list — semua bisa, tapi operator difilter di dalam */}
        <Route path="penilaian" element={<PenilaianListPage />} />
        <Route path="penilaian/:id" element={<PenilaianDetailPage />} />

        {/* Buat & edit — hanya admin & pengawas */}
        <Route path="penilaian/baru" element={
          <RoleRoute check={can.createPenilaian}><PenilaianFormPage /></RoleRoute>
        } />
        <Route path="penilaian/:id/edit" element={
          <RoleRoute check={can.editPenilaian}><PenilaianFormPage /></RoleRoute>
        } />

        {/* Instrumen — hanya admin & pengawas */}
        <Route path="penilaian/:id/instrumen/:tahun" element={
          <RoleRoute check={can.inputSkor}><InstrumenPage /></RoleRoute>
        } />

        {/* Rekap — hanya admin & pengawas */}
        <Route path="rekap" element={
          <RoleRoute check={can.viewRekap}><RekapPage /></RoleRoute>
        } />

        {/* User management — hanya admin */}
        <Route path="users" element={
          <RoleRoute check={can.manageUsers}><UserManagementPage /></RoleRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm' }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
