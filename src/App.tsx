import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Sidebar from '@/components/layout/Sidebar';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import FunilVendas from '@/pages/FunilVendas';
import NovoEvento from '@/pages/NovoEvento';
import Servicos from '@/pages/Servicos';
import Equipe from '@/pages/Equipe';
import Login from '@/pages/Login';
import Settings from '@/pages/Settings';
import { Button } from '@/components/ui/Button';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';
import type { TabKey, Usuario } from '@/types';

const PAGES: Record<TabKey, React.ComponentType> = {
  dashboard: Dashboard,
  funil: FunilVendas,
  'novo-evento': NovoEvento,
  servicos: Servicos,
  equipe: Equipe,
  settings: Settings,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  useEffect(() => {
    // Timeout de segurança: se o Firebase demorar mais de 3s, libera a tela
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Firebase Auth demorou demais. Forçando exibição.");
        setLoading(false);
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(db, 'usuarios', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as Usuario);
          }
        } catch (err) {
          console.error("Erro ao carregar perfil:", err);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      clearTimeout(timer);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSignOut = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-base">
        <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // GATE DE APROVAÇÃO
  if (profile && !profile.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full card-gradient border border-surface-border p-8 rounded-3xl glass text-center"
        >
          <div className="w-20 h-20 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-brand-yellow animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
            Aguardando Aprovação
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Olá, <span className="font-bold text-text-primary">{profile.nome}</span>! Sua conta foi criada, mas um administrador precisa aprovar seu acesso ao GatoMiaX.
          </p>
          
          <div className="bg-surface-raised/50 border border-surface-border-subtle p-4 rounded-2xl mb-8 flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted italic">
              Se você é um dos administradores oficiais, verifique se usou o e-mail da whitelist ou peça para outro admin aprovar seu UID no sistema.
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full gap-2 border-surface-border text-text-secondary hover:text-danger hover:border-danger/30"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </motion.div>
      </div>
    );
  }

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
