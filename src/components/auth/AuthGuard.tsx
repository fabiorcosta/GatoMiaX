import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { motion } from 'motion/react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/Button';

export default function AuthGuard() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [approved, setApproved] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthenticated(true);
        try {
          // Verificar aprovação no Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setApproved(userDoc.data().approved === true);
          } else {
            // Se o usuário logou mas não tem registro, criar um pendente
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              displayName: user.displayName,
              approved: false,
              createdAt: serverTimestamp()
            });
            setApproved(false);
          }
        } catch (err) {
          console.error("AuthGuard whitelist error:", err);
          setApproved(false);
        }
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-base">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full mx-auto"
          />
          <p className="mt-4 text-text-muted text-sm font-medium animate-pulse">Autenticando acesso...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!approved) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-base p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full card-gradient rounded-3xl p-8 border border-surface-border glass text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-warning/20">
            <ShieldAlert className="w-10 h-10 text-warning" />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Acesso Restrito</h2>
          <p className="text-text-secondary text-sm mb-8">
            Seu acesso ao backoffice do **GatoMiaX** está pendente de aprovação. 
            Entre em contato com o administrador para liberar seu usuário.
          </p>
          <div className="space-y-3">
             <div className="bg-surface-base/50 p-4 rounded-2xl border border-surface-border-subtle text-left mb-6">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Usuário Logado</p>
                <p className="text-sm font-bold text-text-primary truncate">{auth.currentUser?.email}</p>
             </div>
             <Button variant="outline" className="w-full gap-2 py-6 rounded-2xl" onClick={handleSignOut}>
               <LogOut className="w-4 h-4" /> Resetar Sessão
             </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <Outlet />;
}
