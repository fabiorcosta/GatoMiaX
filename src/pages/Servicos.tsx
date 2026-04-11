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
import { Search, AlertCircle } from 'lucide-react';
import type { Servico } from '@/types';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceModal } from '@/components/ServiceModal';

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

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
    } else {
      setEditingServico(null);
    }
    setIsModalOpen(true);
  };

  const handleModalSave = async (formData: Partial<Servico>) => {
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

      <ServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={editingServico}
        onSave={handleModalSave}
        servicosCadastrados={servicos}
      />
    </motion.div>
  );
}
