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
import { PlusCircle, Search, AlertCircle } from 'lucide-react';
import type { Servico } from '@/types';
import { ServiceCard } from '@/components/ServiceCard';

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    precoSugerido: 0,
    nivelMinimo: 1,
    ativo: true,
  });

  // Fetch Services
  useEffect(() => {
    const q = query(collection(db, 'servicos'), orderBy('nome', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Servico));
      setServicos(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (servico?: Servico) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        precoSugerido: servico.precoSugerido,
        nivelMinimo: servico.nivelMinimo,
        ativo: servico.ativo,
      });
    } else {
      setEditingServico(null);
      setFormData({ nome: '', precoSugerido: 0, nivelMinimo: 1, ativo: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingServico) {
        await updateDoc(doc(db, 'servicos', editingServico.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'servicos'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          checklist: [],
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar. Verifique se o banco de dados está configurado.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteDoc(doc(db, 'servicos', id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  };

  const handleToggleActive = async (servico: Servico) => {
    try {
      await updateDoc(doc(db, 'servicos', servico.id), {
        ativo: !servico.ativo,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao mudar status:", error);
    }
  };

  const filteredServicos = servicos.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Serviços</h1>
          <p className="text-text-secondary mt-1">Gerencie o catálogo de recreação e preços.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0">
          <PlusCircle className="w-4 h-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="card-gradient rounded-3xl border border-surface-border glass overflow-hidden shadow-xl">
        <div className="p-4 border-b border-surface-border-subtle bg-surface-raised/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar serviço..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-base border border-surface-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
            />
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-medium uppercase tracking-widest">Carregando catálogo...</p>
            </div>
          ) : filteredServicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted border-2 border-dashed border-surface-border rounded-2xl">
              <AlertCircle className="w-8 h-8 mb-4 opacity-20" />
              <p className="text-sm">Nenhum serviço encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServicos.map(serv => (
                <ServiceCard 
                  key={serv.id} 
                  service={serv} 
                  mode="admin" 
                  onEdit={handleOpenModal}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingServico ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nome do Serviço</label>
            <Input 
              required
              placeholder="Ex: Pintura Facial"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Preço Sugerido</label>
              <Input 
                type="number"
                required
                value={formData.precoSugerido}
                onChange={e => setFormData({ ...formData, precoSugerido: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nível Mínimo</label>
              <select 
                title="Nível Mínimo"
                className="w-full h-10 px-4 py-2 bg-surface-base border border-surface-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple text-text-primary"
                value={formData.nivelMinimo}
                onChange={e => setFormData({ ...formData, nivelMinimo: Number(e.target.value) })}
              >
                <option value={1}>Nível 1 (Básico)</option>
                <option value={2}>Nível 2 (Intermediário)</option>
                <option value={3}>Nível 3 (Avançado/Show)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-surface-base rounded-2xl border border-surface-border-subtle cursor-pointer transition-all hover:border-brand-purple/30" onClick={() => setFormData({ ...formData, ativo: !formData.ativo })}>
            <div className={`w-10 h-6 rounded-full relative transition-all duration-300 ${formData.ativo ? 'bg-success' : 'bg-surface-border'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.ativo ? 'left-5' : 'left-1'}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary uppercase tracking-tight">Serviço Ativo</p>
              <p className="text-[10px] text-text-muted">Serviços inativos não aparecem na criação de eventos.</p>
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
            <Button type="submit" className="flex-1">
              Finalizar
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
