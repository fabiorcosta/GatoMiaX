import { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogIn, Lock, Mail, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ADICIONE AQUI OS E-MAILS QUE SERÃO ADMINISTRADORES AUTOMÁTICOS
const ADMIN_WHITELIST = [
  'fabiorcosta@gmail.com',
  'vc.moretti.vm@gmail.com'
];

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState(''); // Novo campo para o Perfil
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
      if (isRegister) {
        if (!nome) throw new Error('Nome é obrigatório');

        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
        const user = userCredential.user;

        // Verifica se está na whitelist
        const isAdmin = ADMIN_WHITELIST.includes(email.toLowerCase().trim());

        // Criar perfil no Firestore
        await setDoc(doc(db, 'usuarios', user.uid), {
          id: user.uid,
          nome,
          email: email.toLowerCase().trim(),
          role: isAdmin ? 'admin' : 'viewer',
          approved: isAdmin, // Auto-aprova se for admin
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });

        setSuccess(true);
      } else {
        await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('E-mail ou senha inválidos. Verifique seu console do Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-yellow/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="card-gradient rounded-3xl border border-surface-border glass p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div
              key={isRegister ? 'reg' : 'log'}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-brand-purple/20 rounded-2xl flex items-center justify-center mb-4 border border-brand-purple/30"
            >
              {isRegister ? (
                <UserPlus className="w-8 h-8 text-brand-purple" />
              ) : (
                <LogIn className="w-8 h-8 text-brand-purple" />
              )}
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
              GatoMia<span className="text-brand-yellow">X</span>
            </h1>
            <div className="flex bg-surface-base border border-surface-border-subtle p-1 rounded-xl mt-6 w-full">
              <button
                onClick={() => { setIsRegister(false); setError(null); }}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                  !isRegister ? "bg-brand-purple text-brand-yellow" : "text-text-muted hover:text-text-primary"
                )}
              >
                LOGIN
              </button>
              <button
                onClick={() => { setIsRegister(true); setError(null); }}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                  isRegister ? "bg-brand-purple text-brand-yellow" : "text-text-muted hover:text-text-primary"
                )}
              >
                CRIAR CONTA
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-xs font-semibold text-text-muted ml-1 uppercase tracking-wider text-[10px]">
                  Nome Completo
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  icon={<LogIn className="w-4 h-4 opacity-0" />} // Spacer icon
                  required={isRegister}
                />
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted ml-1 uppercase tracking-wider text-[10px]">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="exemplo@gatomia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider text-[10px]">
                  Senha
                </label>
                {!isRegister && (
                  <button type="button" className="text-[10px] font-bold text-brand-purple hover:text-brand-purple-light transition-colors">
                    ESQUECEU?
                  </button>
                )}
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger/10 border border-danger/20 p-3 rounded-xl flex items-center gap-3 text-danger text-[11px] font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-success/10 border border-success/20 p-3 rounded-xl flex items-center gap-3 text-success text-[11px] font-medium"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Conta criada! Redirecionando...
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold mt-4 uppercase tracking-widest"
              isLoading={loading}
            >
              {isRegister ? 'Criar Acesso' : 'Acessar Painel'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-border-subtle text-center">
            <p className="text-text-muted text-xs italic">
              "Painel Administrativo v0.1.0"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
