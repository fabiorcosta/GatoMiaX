import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FUNIL_STAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Calendar, User, DollarSign, Clock } from 'lucide-react';
import type { Evento } from '@/types';

export default function FunilVendas() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca eventos ordenados por tempo de atualização para consistência visual
    const q = query(collection(db, 'eventos'), orderBy('statusUpdatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Evento));
      setEventos(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Otimista: Move na UI instantaneamente
    const novoStatus = destination.droppableId as Evento['status'];
    const eventoArrastado = eventos.find(e => e.id === draggableId);
    if (!eventoArrastado) return;

    setEventos(prev => prev.map(e => 
      e.id === draggableId ? { ...e, status: novoStatus } : e
    ));

    // Atualiza no banco real
    try {
      await updateDoc(doc(db, 'eventos', draggableId), {
        status: novoStatus,
        statusUpdatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      // Rollback poderia ser feito aqui caso o DB falhe
    }
  };

  const formataData = (dataOriginal: any) => {
    if (!dataOriginal) return 'Não definida';
    // Se for string yyyy-mm-dd
    if (typeof dataOriginal === 'string') {
      const [year, month, day] = dataOriginal.split('-');
      if (year && month && day) return `${day}/${month}/${year}`;
      return dataOriginal;
    }
    return 'Data inválida';
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Funil de Vendas</h1>
          <p className="text-text-secondary mt-1">
            Gerencie o fluxo de orçamentos e conversões. Arraste os cards para atualizar o status.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full min-w-max items-start">
              {FUNIL_STAGES.map((stage) => {
                const stageEventos = eventos.filter((e) => e.status === stage.key);
                
                return (
                  <div key={stage.key} className="flex flex-col w-[320px] h-full shrink-0">
                    {/* Header da Coluna */}
                    <div 
                      className="px-4 py-3 rounded-t-xl border-t-4 bg-surface-raised mb-2 flex justify-between items-center"
                      style={{ borderTopColor: stage.color }}
                    >
                      <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
                        {stage.label}
                      </h3>
                      <span className="bg-surface-base px-2 py-1 rounded-md text-xs font-black text-text-muted border border-surface-border-subtle">
                        {stageEventos.length}
                      </span>
                    </div>

                    {/* Área "Dropável" (Corpo da Coluna) */}
                    <Droppable droppableId={stage.key}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 rounded-b-xl p-2 transition-colors overflow-y-auto custom-scrollbar border border-surface-border-subtle ${
                            snapshot.isDraggingOver ? 'bg-surface-raised/80' : 'bg-surface-base/50'
                          }`}
                        >
                          {stageEventos.map((evento, index) => (
                            <Draggable key={evento.id} draggableId={evento.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-4 rounded-xl border border-surface-border mb-3 select-none flex flex-col gap-3 transition-transform ${
                                    snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl glass z-50 border-brand-purple' : 'bg-surface-raised hover:border-surface-hover shadow-md'
                                  }`}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  {/* Header do Card */}
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-bold text-text-primary leading-tight text-sm">
                                      {evento.clienteNome}
                                    </h4>
                                    {evento.tipoEvento === 'festa' ? (
                                      <span className="shrink-0 bg-brand-purple/10 text-brand-purple text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-brand-purple/20">
                                        Festa
                                      </span>
                                    ) : (
                                      <span className="shrink-0 bg-info/10 text-info text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-info/20">
                                        Colônia
                                      </span>
                                    )}
                                  </div>

                                  {/* Info Financeira & Data */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                      <DollarSign className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                                      <span className="font-semibold text-text-primary tracking-tight">
                                        {formatCurrency(evento.valorTotal)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                      <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                      <span>{formataData(evento.data)}</span>
                                    </div>
                                  </div>

                                  {/* Footer do Card */}
                                  <div className="pt-3 border-t border-surface-border-subtle flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-text-muted">
                                      <User className="w-3 h-3" />
                                      <span>
                                        {evento.equipe?.length || 0} na Equipe
                                      </span>
                                    </div>
                                    
                                    {/* Exibe o lucro apenas para visualização rápida da saúde do evento */}
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-[10px] text-text-muted uppercase tracking-tighter">Lucro</span>
                                      <span className={`font-black tracking-tight ${evento.margemPercent < 30 ? 'text-danger' : evento.margemPercent < 50 ? 'text-warning' : 'text-success'}`}>
                                        {formatCurrency(evento.lucroLiquido)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          
                          {/* Espaço vazio se não tiver eventos e não estiver arrastando (para estética) */}
                          {stageEventos.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-20 flex items-center justify-center border-2 border-dashed border-surface-border-subtle rounded-xl m-2 opacity-50">
                              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Coluna Vazia</span>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
