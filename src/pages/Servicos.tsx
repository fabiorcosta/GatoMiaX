import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Search, Edit2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Servico } from '@/types';

const mockServicos: Servico[] = [
  { id: '1', nome: 'Pintura Facial', precoSugerido: 150, ativo: true, checklist: ['Tintas', 'Pincéis'], nivelMinimo: 1, createdAt: '', updatedAt: '' },
  { id: '2', nome: 'Oficina de Slime', precoSugerido: 250, ativo: true, checklist: ['Cola', 'Ativador'], nivelMinimo: 2, createdAt: '', updatedAt: '' },
  { id: '3', nome: 'Piscina de Bolinhas', precoSugerido: 400, ativo: false, checklist: ['Piscina', 'Bolinhas'], nivelMinimo: 1, createdAt: '', updatedAt: '' },
];

export default function Servicos() {
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
            Serviços
          </h1>
          <p className="text-text-secondary mt-1">
            Catálogo de serviços, preços sugeridos e níveis requeridos.
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="card-gradient rounded-xl border border-surface-border glass overflow-hidden">
        <div className="p-4 border-b border-surface-border-subtle flex gap-4 bg-surface-raised">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar serviço..." 
              className="w-full pl-9 pr-4 py-2 bg-surface-base border border-surface-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {mockServicos.map(serv => (
            <div key={serv.id} className="bg-surface-raised border border-surface-border-subtle rounded-xl p-5 hover:border-brand-purple transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-display font-bold text-lg text-text-primary">{serv.nome}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${serv.ativo ? 'bg-success/20 text-success' : 'bg-surface-border text-text-muted'}`}>
                  {serv.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Preço Sugerido:</span>
                  <span className="font-medium text-brand-yellow">{formatCurrency(serv.precoSugerido)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Nível Mínimo:</span>
                  <span className="font-medium text-text-primary">Nível {serv.nivelMinimo}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border-subtle flex justify-end">
                <button className="text-text-muted hover:text-brand-yellow transition-colors flex items-center gap-1.5 text-sm">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
