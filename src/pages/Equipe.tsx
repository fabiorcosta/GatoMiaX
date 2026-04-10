import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Search, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { SALARIOS_POR_NIVEL } from '@/lib/constants';
import type { Recreador } from '@/types';

const mockRecreadores: Recreador[] = [
  { id: '1', nome: 'Lulu', nivel: 2, salario: SALARIOS_POR_NIVEL[2], ativo: true, totalEventos: 15, createdAt: '', updatedAt: '', conducao: true },
  { id: '2', nome: 'Panda', nivel: 3, salario: SALARIOS_POR_NIVEL[3], ativo: true, totalEventos: 41, createdAt: '', updatedAt: '', conducao: false },
  { id: '3', nome: 'Zeca', nivel: 1, salario: SALARIOS_POR_NIVEL[1], ativo: false, totalEventos: 5, createdAt: '', updatedAt: '', conducao: false },
];

export default function Equipe() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Equipe
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie recreadores, níveis e salários base.
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Novo Recreador
        </Button>
      </div>

      <div className="card-gradient rounded-xl border border-surface-border glass overflow-hidden">
        <div className="p-4 border-b border-surface-border-subtle flex gap-4 bg-surface-raised">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar recreador..." 
              className="w-full pl-9 pr-4 py-2 bg-surface-base border border-surface-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-raised/50 border-b border-surface-border-subtle text-text-muted">
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Nível</th>
                <th className="px-6 py-4 font-semibold">Salário (Base)</th>
                <th className="px-6 py-4 font-semibold">Eventos</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border-subtle">
              {mockRecreadores.map(rec => (
                <tr key={rec.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">{rec.nome}</td>
                  <td className="px-6 py-4">Nível {rec.nivel}</td>
                  <td className="px-6 py-4 text-brand-yellow font-medium">{formatCurrency(rec.salario)}</td>
                  <td className="px-6 py-4">{rec.totalEventos}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${rec.ativo ? 'bg-success/20 text-success' : 'bg-surface-border text-text-muted'}`}>
                      {rec.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-text-muted hover:text-brand-yellow transition-colors p-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
