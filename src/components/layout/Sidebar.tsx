import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Filter,
  PlusCircle,
  Briefcase,
  Users,
  Menu,
  X,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { TabKey } from '@/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useConfig } from '@/lib/settings';

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
  { key: 'settings', label: 'Configurações', icon: SettingsIcon },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [funilCount, setFunilCount] = useState(0);
  const { config } = useConfig();

  useEffect(() => {
    // Escuta apenas eventos que não estão em colunas de conclusão (sucesso ou perda)
    const terminalIds = config.funnel_stages
      .filter((col: any) => col.categoria === 'sucesso' || col.categoria === 'perda')
      .map((col: any) => col.id);
    
    if (terminalIds.length === 0) return;

    const q = query(
      collection(db, 'eventos'),
      where('statusId', 'not-in', terminalIds)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFunilCount(snapshot.size);
    }, (error) => {
      console.warn("Sidebar Funil Counter Error:", error);
    });

    return () => unsubscribe();
  }, [config.funnel_stages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface-raised border-r border-surface-border-subtle transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo — roxo + amarelo como no site */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 mascot-badge flex items-center justify-center text-lg">
              🐱
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight leading-none">
                <span className="text-brand-yellow">GATO</span>
                <span className="text-brand-purple-light">MIA</span>
                <span className="text-text-muted text-xs font-normal ml-1">X</span>
              </h1>
              <p className="text-[10px] text-text-muted mt-1 tracking-widest uppercase font-medium">
                Recreação
              </p>
            </div>
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
                "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer group",
                activeTab === key
                  ? "bg-brand-purple text-brand-yellow glow-purple font-semibold"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon className={cn(
                "w-4.5 h-4.5 mr-3 shrink-0 transition-colors",
                activeTab === key ? "text-brand-yellow" : "text-text-muted group-hover:text-text-secondary"
              )} />
              {label}
              {key === 'funil' && funilCount > 0 && (
                <span className="ml-auto text-[10px] bg-brand-yellow text-text-inverse px-2 py-0.5 rounded-full font-black min-w-[20px] text-center shadow-sm">
                  {funilCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer — perfil do Victor */}
        <div className="px-4 py-4 border-t border-surface-border-subtle bg-surface-base/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center text-sm font-bold text-brand-purple shadow-lg shadow-brand-yellow/10">
              V
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">Victor Hugo</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Administrador</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-danger bg-danger/5 hover:bg-danger/10 border border-danger/20 rounded-xl transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            Encerrar Sessão
          </button>
        </div>
      </aside>
    </>
  );
}
