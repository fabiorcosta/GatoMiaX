import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Sidebar from '@/components/layout/Sidebar';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import FunilVendas from '@/pages/FunilVendas';
import NovoEvento from '@/pages/NovoEvento';
import Servicos from '@/pages/Servicos';
import Equipe from '@/pages/Equipe';
import type { TabKey } from '@/types';

const PAGES: Record<TabKey, () => JSX.Element> = {
  dashboard: Dashboard,
  funil: FunilVendas,
  'novo-evento': NovoEvento,
  servicos: Servicos,
  equipe: Equipe,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const ActivePage = PAGES[activeTab];

  return (
    <div className="flex h-screen bg-surface-base">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <MainLayout>
        <AnimatePresence mode="wait">
          <ActivePage key={activeTab} />
        </AnimatePresence>
      </MainLayout>
    </div>
  );
}
