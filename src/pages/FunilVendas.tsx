import { motion } from 'motion/react';
import { Rocket, Clock, ShieldCheck } from 'lucide-react';

export default function FunilVendas() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center space-y-8"
    >
      <div className="relative">
        <div className="absolute -inset-4 bg-brand-purple/20 blur-2xl rounded-full animate-pulse" />
        <div className="relative bg-surface-raised border border-surface-border p-6 rounded-2xl glass shadow-2xl">
          <Rocket className="w-12 h-12 text-brand-purple animate-bounce" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-display font-bold text-text-primary tracking-tight">
          Funil de Vendas <span className="text-brand-yellow">Inteligente</span>
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          Estamos construindo um motor de gestão de leads via Kanban para automatizar o fluxo de recreação do Gato Mia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <div className="flex items-center gap-3 p-4 bg-surface-raised/50 border border-surface-border-subtle rounded-xl text-left">
          <Clock className="w-5 h-5 text-brand-yellow" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Fase 3</p>
            <p className="text-xs text-text-muted">Lançamento em breve</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-surface-raised/50 border border-surface-border-subtle rounded-xl text-left">
          <ShieldCheck className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Sync Realtime</p>
            <p className="text-xs text-text-muted">Powered by Firebase</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <span className="px-4 py-1.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold uppercase tracking-widest rounded-full">
          Development in Progress
        </span>
      </div>
    </motion.div>
  );
}
