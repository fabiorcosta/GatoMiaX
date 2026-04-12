import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { auth } from '@/lib/firebase';

// Layout
import Sidebar from '@/components/layout/Sidebar';
import MainLayout from '@/components/layout/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import ScrollToTop from '@/components/layout/ScrollToTop';

// Pages
import Dashboard from '@/pages/Dashboard';
import FunilVendas from '@/pages/FunilVendas';
import NovoEvento from '@/pages/NovoEvento';
import Servicos from '@/pages/Servicos';
import Equipe from '@/pages/Equipe';
import Login from '@/pages/Login';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={
          auth.currentUser ? <Navigate to="/" replace /> : <Login />
        } />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          {/* Main Layout Wrapper */}
          <Route element={
            <div className="flex h-screen bg-surface-base">
              <Sidebar />
              <MainLayout>
                <Outlet />
              </MainLayout>
            </div>
          }>
            <Route path="/" element={<Dashboard />} />
            
            {/* Funil Routes */}
            <Route path="/funil" element={<FunilVendas />} />
            <Route path="/funil/:stageId" element={<FunilVendas />} />
            <Route path="/funil/:stageId/:leadId" element={<FunilVendas />} />
            
            {/* Eventos Routes */}
            <Route path="/eventos/novo" element={<NovoEvento />} />
            <Route path="/eventos/:eventId" element={<NovoEvento />} />
            
            {/* Other Pages */}
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/equipe" element={<Equipe />} />
            
            {/* Config Routes */}
            <Route path="/configuracoes" element={<Navigate to="/configuracoes/funnel" replace />} />
            <Route path="/configuracoes/:tab" element={<Settings />} />
          </Route>
        </Route>

        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
