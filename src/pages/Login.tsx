import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogIn, Lock, Mail, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ADMINS AUTOMÁTICOS
const ADMIN_WHITELIST = [
  'fabiorcosta@gmail.com',
  'vc.moretti.vm@gmail.com'
];

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const cleanEmail = email.toLowerCase().trim();
      if (isRegister) {
        if (!nome) throw new Error('Nome é obrigatório');
        
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        const isAdmin = ADMIN_WHITELIST.includes(cleanEmail);

        await setDoc(doc(db, 'usuarios', user.uid), {
          id: user.uid,
          nome,
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'viewer',
          approved: isAdmin,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });

        setSuccess(true);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Ocorreu um erro. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-base p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-brand-purple/30">
      {/* Background Decorativo Estável */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-purple/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-yellow/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] min-w-[280px] relative z-10"
      >
        <div className="card-gradient rounded-[32px] border border-surface-border glass p-6 sm:p-10 shadow-2xl flex flex-col">
          {/* Header - Logo & Toggle */}
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              key={isRegister ? 'reg' : 'log'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 bg-brand-purple/20 rounded-2xl flex items-center justify-center mb-6 border border-brand-purple/30 shadow-inner"
            >
              {isRegister ? (
                <UserPlus className="w-7 h-7 text-brand-purple" />
              ) : (
                <LogIn className="w-7 h-7 text-brand-purple" />
              )}
            </motion.div>
            
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight leading-none mb-1 text-center">
              GatoMia<span className="text-brand-yellow">X</span>
            </h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-medium mb-8 text-center">
              Backoffice Intelligence
            </p>

            {/* Login/Register Toggle Switch */}
            <div className="flex bg-surface-base/80 border border-surface-border-subtle p-1 rounded-2xl w-full max-w-[240px]">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className={cn(
                  "flex-1 py-1 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                  !isRegister ? "bg-brand-purple text-brand-yellow shadow-lg" : "text-text-muted hover:text-text-primary"
                )}
              >
                Acessar
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className={cn(
                  "flex-1 py-1 text-[10px] font-black rounded-xl transition-all uppercase tracking-tighter",
                  isRegister ? "bg-brand-purple text-brand-yellow shadow-lg" : "text-text-muted hover:text-text-primary"
                )}
              >
                Cadastrar
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <AnimatePresence mode="popLayout">
              {isRegister && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-bold text-text-muted ml-1 uppercase tracking-widest">
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    placeholder="Como devemos te chamar?"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required={isRegister}
                    className="h-10"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted ml-1 uppercase tracking-widest">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 opacity-40" />}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Senha
                </label>
                {!isRegister && (
                  <button type="button" className="text-[10px] font-black text-brand-purple hover:text-brand-purple-light transition-colors">
                    ESQUECEU?
                  </button>
                )}
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4 opacity-40" />}
                required
                className="h-10"
              />
            </div>

            <div className="pt-2">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-danger/10 border border-danger/20 p-3 rounded-xl flex items-center gap-3 text-danger text-[11px] font-medium mb-4"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-success/10 border border-success/20 p-3 rounded-xl flex items-center gap-3 text-success text-[11px] font-medium mb-4"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Conta criada com sucesso!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-purple/20 transition-all hover:shadow-brand-purple/40 active:scale-[0.98]"
                isLoading={loading}
              >
                {isRegister ? 'Criar Acesso' : 'Entrar no Painel'}
              </Button>
            </div>
          </form>

          <footer className="mt-8 pt-6 border-t border-surface-border-subtle text-center">
            <p className="text-[10px] text-text-muted font-medium italic opacity-60">
              Versão 0.1.0-A • Gato Mia Recreação
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
