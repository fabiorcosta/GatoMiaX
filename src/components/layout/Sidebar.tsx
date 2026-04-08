import { useState } from 'react';
import {
  LayoutDashboard,
  Filter,
  PlusCircle,
  Briefcase,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { TabKey } from '@/types';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const NAV_ITEMS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'funil', label: 'Funil de Vendas', icon: Filter },
  { key: 'novo-evento', label: 'Novo Evento', icon: PlusCircle },
  { key: 'servicos', label: 'Serviços', icon: Briefcase },
  { key: 'equipe', label: 'Equipe', icon: Users },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-raised text-text-primary lg:hidden"
        aria-label="Abrir menu"
        id="sidebar-mobile-toggle"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface-raised border-r border-surface-border transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <h1 className="font-display text-lg font-bold text-gradient-brand">
              GatoMiaX
            </h1>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 text-text-muted hover:text-text-primary lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              id={`nav-${key}`}
              onClick={() => {
                onTabChange(key);
                setMobileOpen(false);
              }}
              className={cn(
                "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                activeTab === key
                  ? "bg-brand-yellow text-surface-base glow-yellow font-semibold"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
              {label}
              {key === 'funil' && (
                <span className="ml-auto text-xs bg-danger/20 text-danger px-1.5 py-0.5 rounded-full font-semibold">
                  3
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-pink/20 flex items-center justify-center text-xs font-bold text-brand-pink">
              V
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">Victor</p>
              <p className="text-xs text-text-muted">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
