import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { motion } from 'motion/react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/Button';

const ADMIN_WHITELIST = [
  'fabiorcosta@gmail.com',
  'vc.moretti.vm@gmail.com'
];

export default function AuthGuard() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [approved, setApproved] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthenticated(true);
        
        // Auto-approve if in whitelist
        const isAdmin = user.email ? ADMIN_WHITELIST.includes(user.email.toLowerCase()) : false;
        
        try {
          // Verificar aprovação no Firestore
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const isApproved = data.approved === true || isAdmin;
            
            // Corrige no banco se for admin mas estiver listado como false
            if (isAdmin && data.approved !== true) {
              await setDoc(doc(db, 'usuarios', user.uid), { approved: true }, { merge: true });
            }
            
            setApproved(isApproved);
          } else {
            // Se o usuário logou mas não tem registro, criar um pendente
            await setDoc(doc(db, 'usuarios', user.uid), {
              email: user.email,
              displayName: user.displayName,
              approved: isAdmin,
              role: isAdmin ? 'admin' : 'viewer',
              createdAt: serverTimestamp()
            });
            setApproved(isAdmin);
          }
        } catch (err) {
          console.error("AuthGuard whitelist error:", err);
          setApproved(isAdmin); // Libera o admin mesmo que o DB falhe momentaneamente
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
      <div className="fixed inset-0 grid place-items-center bg-surface-base z-[9999]" style={{ width: '100vw', height: '100vh' }}>
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
      <div 
        className="fixed inset-0 grid place-items-center bg-surface-base p-6 z-[9999]"
        style={{ width: '100vw', height: '100vh', boxSizing: 'border-box' }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-gradient rounded-3xl p-8 border border-surface-border glass text-center shadow-2xl flex flex-col items-center"
          style={{ 
            width: '420px', 
            maxWidth: '95vw',
            minHeight: '200px',
            boxSizing: 'border-box'
          }}
        >
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-6 border border-warning/20">
            <ShieldAlert className="w-8 h-8 text-warning" />
          </div>
          
          <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Acesso Restrito</h2>
          
          <p className="text-text-secondary text-sm mb-8 leading-relaxed">
            Seu acesso ao backoffice do **GatoMiaX** está pendente de aprovação. 
            Entre em contato com o administrador para liberar seu usuário.
          </p>

          <div className="w-full space-y-4">
             <div className="bg-surface-base/50 p-4 rounded-xl border border-surface-border-subtle text-left overflow-hidden">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Usuário Logado</p>
                <p className="text-xs font-bold text-text-primary truncate">{auth.currentUser?.email}</p>
             </div>
             
             <Button variant="outline" className="w-full h-12 gap-2" onClick={handleSignOut}>
               <LogOut className="w-4 h-4" /> Resetar Sessão
             </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <Outlet />;
}
