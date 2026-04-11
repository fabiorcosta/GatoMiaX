import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PlusCircle, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SALARIOS_POR_NIVEL } from '@/lib/constants';
import type { Recreador } from '@/types';

export default function Equipe() {
  const [recreadores, setRecreadores] = useState<Recreador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecreador, setEditingRecreador] = useState<Recreador | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    nivel: 1,
    ativo: true,
    conducao: false,
  });

  // Fetch Team
  useEffect(() => {
    const q = query(collection(db, 'recreadores'), orderBy('nome', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recreador));
      setRecreadores(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (rec?: Recreador) => {
    if (rec) {
      setEditingRecreador(rec);
      setFormData({
        nome: rec.nome,
        nivel: rec.nivel,
        ativo: rec.ativo,
        conducao: rec.conducao || false,
      });
    } else {
      setEditingRecreador(null);
      setFormData({ nome: '', nivel: 1, ativo: true, conducao: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Salário dinâmico baseado no nível
      const salarioBase = SALARIOS_POR_NIVEL[formData.nivel as keyof typeof SALARIOS_POR_NIVEL] || 0;
      
      if (editingRecreador) {
        await updateDoc(doc(db, 'recreadores', editingRecreador.id), {
          ...formData,
          salario: salarioBase,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'recreadores'), {
          ...formData,
          salario: salarioBase,
          totalEventos: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar recreador:", error);
      alert("Erro ao salvar. Verifique se o banco de dados está configurado.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este recreador?')) {
      try {
        await deleteDoc(doc(db, 'recreadores', id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  };

  const filteredRecreadores = recreadores.filter(r => 
    r.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Equipe</h1>
          <p className="text-text-secondary mt-1">Gerencie recreadores, níveis e status.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0">
          <PlusCircle className="w-4 h-4" />
          Novo Recreador
        </Button>
      </div>

      <div className="card-gradient rounded-3xl border border-surface-border glass overflow-hidden shadow-xl">
        <div className="p-4 border-b border-surface-border-subtle bg-surface-raised/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar recreador..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-base border border-surface-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-medium uppercase tracking-widest">Carregando equipe...</p>
            </div>
          ) : filteredRecreadores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted border-2 border-dashed border-surface-border rounded-2xl m-6">
              <AlertCircle className="w-8 h-8 mb-4 opacity-20" />
              <p className="text-sm">Nenhum recreador encontrado.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-surface-raised/30 border-b border-surface-border-subtle text-text-muted text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-black">Nome</th>
                  <th className="px-6 py-4 font-black">Nível</th>
                  <th className="px-6 py-4 font-black">Salário Base</th>
                  <th className="px-6 py-4 font-black">Eventos</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border-subtle">
                <AnimatePresence>
                  {filteredRecreadores.map(rec => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={rec.id} 
                      className="hover:bg-brand-purple/5 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-text-primary">{rec.nome}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 w-fit px-2 py-1 bg-surface-base rounded-md border border-surface-border-subtle">
                          <div className={`w-1.5 h-1.5 rounded-full ${rec.nivel === 3 ? 'bg-brand-yellow' : 'bg-brand-purple'}`} />
                          <span className="text-[10px] font-bold text-text-primary">NÍVEL {rec.nivel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brand-yellow font-black">{formatCurrency(rec.salario)}</td>
                      <td className="px-6 py-4 font-medium text-text-secondary">{rec.totalEventos}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${rec.ativo ? 'bg-success/10 text-success border border-success/20' : 'bg-surface-border text-text-muted border border-surface-border-subtle'}`}>
                          {rec.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDelete(rec.id)}
                            className="p-2 hover:bg-danger/10 text-text-muted hover:text-danger rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(rec)}
                            className="p-2 hover:bg-brand-purple/20 text-text-muted hover:text-brand-yellow rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRecreador ? 'Editar Recreador' : 'Novo Recreador'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nome do Recreador</label>
            <Input 
              required
              placeholder="Ex: João Silva"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nível de Experiência</label>
              <select 
                title="Nível do Recreador"
                className="w-full h-10 pl-4 pr-10 py-2 bg-surface-base border border-surface-border-subtle rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-purple text-text-primary appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23F2F2F2%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-size-[1.2em_1.2em] bg-position-[right_0.8rem_center] bg-no-repeat"
                value={formData.nivel}
                onChange={e => setFormData({ ...formData, nivel: Number(e.target.value) })}
              >
                <option value={1}>Nível 1 (Básico)</option>
                <option value={2}>Nível 2 (Intermediário)</option>
                <option value={3}>Nível 3 (Sênior)</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center justify-between">
                Salário Base
                <span className="text-brand-yellow/50">Auto</span>
              </label>
              <div className="h-10 px-4 py-2 bg-surface-base/50 border border-surface-border-subtle rounded-xl text-sm font-black text-brand-yellow flex items-center cursor-not-allowed opacity-80">
                {formatCurrency(SALARIOS_POR_NIVEL[formData.nivel as keyof typeof SALARIOS_POR_NIVEL] || 0)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Toggle Status */}
            <div className="flex items-center gap-3 p-4 bg-surface-base rounded-2xl border border-surface-border-subtle cursor-pointer transition-all hover:border-brand-purple/30" onClick={() => setFormData({ ...formData, ativo: !formData.ativo })}>
              <div className={`w-10 h-6 shrink-0 rounded-full relative transition-all duration-300 ${formData.ativo ? 'bg-success' : 'bg-surface-border'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.ativo ? 'left-5' : 'left-1'}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-primary uppercase tracking-tight">Ativo na Escala</p>
                <p className="text-[10px] text-text-muted leading-tight">Recreadores inativos não aparecem na criação de eventos.</p>
              </div>
            </div>

            {/* Toggle Condução */}
            <div className="flex items-center gap-3 p-4 bg-surface-base rounded-2xl border border-surface-border-subtle cursor-pointer transition-all hover:border-brand-purple/30" onClick={() => setFormData({ ...formData, conducao: !formData.conducao })}>
              <div className={`w-10 h-6 shrink-0 rounded-full relative transition-all duration-300 ${formData.conducao ? 'bg-brand-purple' : 'bg-surface-border'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.conducao ? 'left-5' : 'left-1'}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-primary uppercase tracking-tight">Possui Condução Própria</p>
                <p className="text-[10px] text-text-muted leading-tight">Facilita escala para eventos distantes que exigem transporte.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 shadow-glow-purple">
              Finalizar
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
