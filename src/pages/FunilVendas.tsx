import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useConfig } from '@/lib/settings';
import { calcRecontactDate, getFinalizationBlockers } from '@/lib/automations';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Calendar, User, DollarSign, AlertCircle } from 'lucide-react';
import type { Evento } from '@/types';
import type { FunnelStage } from '@/types/settings';

export default function FunilVendas() {
  const { config, loading: configLoading } = useConfig();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Modal
  const [checklistModal, setChecklistModal] = useState<{isOpen: boolean, evento?: Evento, nextStage?: FunnelStage, blockers?: string[]}>({isOpen: false});
  const [lostModal, setLostModal] = useState<{isOpen: boolean, evento?: Evento, nextStage?: FunnelStage, reason?: string}>({isOpen: false, reason: 'preço'});

  useEffect(() => {
    const q = query(collection(db, 'eventos'), orderBy('statusUpdatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Evento));
      setEventos(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const persistStageMove = async (eventoId: string, nextStage: FunnelStage, extraPayload: any = {}) => {
    try {
      const payload: any = {
        status: nextStage.id,
        statusUpdatedAt: serverTimestamp(),
        ...extraPayload
      };
      
      await updateDoc(doc(db, 'eventos', eventoId), payload);

      // Regra de lead automático
      if (nextStage.triggers_recontact) {
        const ev = eventos.find(e => e.id === eventoId);
        if (ev) {
          const recurDate = calcRecontactDate(ev, config);
          if (recurDate) {
            await addDoc(collection(db, 'leads'), {
              source_event_id: ev.id,
              client_id: ev.clienteId,
              client_nome: ev.clienteNome,
              scheduled_contact_date: recurDate,
              stage_id: 'novo_lead',
              auto_generated: true,
              note: `Recontato automático - ref festa de ${formataData(ev.data)}`,
              createdAt: serverTimestamp()
            });
          }
        }
      }

    } catch (error) {
      console.error("Erro ao persistir mudança de Kanban:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const eventoArrastado = eventos.find(e => e.id === draggableId);
    if (!eventoArrastado) return;

    const nextStage = config.funnel_stages.find(s => s.id === destination.droppableId);
    if (!nextStage) return;

    // Checagem de Blockers
    const blockers = getFinalizationBlockers(eventoArrastado, nextStage);
    if (blockers.length > 0) {
      setChecklistModal({ isOpen: true, evento: eventoArrastado, nextStage, blockers });
      return; // Pausa drag and drop até modal resolver
    }

    // Checagem de Perdido
    if (nextStage.is_terminal && nextStage.terminal_type === 'lost') {
      setLostModal({ isOpen: true, evento: eventoArrastado, nextStage, reason: 'Sem resposta' });
      return; // Pausa drag and drop até modal resolver
    }

    // Movimentação Limpa (Otimista na UI)
    setEventos(prev => prev.map(e => e.id === draggableId ? { ...e, status: nextStage.id as any } : e));
    await persistStageMove(draggableId, nextStage);
  };

  const formataData = (dataOriginal: any) => {
    if (!dataOriginal) return 'Não definida';
    if (typeof dataOriginal === 'string') {
      const [year, month, day] = dataOriginal.split('-');
      if (year && month && day) return `${day}/${month}/${year}`;
      return dataOriginal;
    }
    return 'Data inválida';
  };

  if (configLoading) {
    return <div className="p-8">Carregando funil...</div>;
  }

  // Ordena colunas
  const stages = [...config.funnel_stages].sort((a,b) => a.order - b.order);

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
              {stages.map((stage) => {
                const stageEventos = eventos.filter((e) => e.status === stage.id);
                
                return (
                  <div key={stage.id} className="flex flex-col w-[320px] h-full shrink-0">
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

                    <Droppable droppableId={stage.id}>
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

                                  <div className="pt-3 border-t border-surface-border-subtle flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-text-muted">
                                      <User className="w-3 h-3" />
                                      <span>
                                        {evento.equipe?.length || 0} na Equipe
                                      </span>
                                    </div>
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

      {/* Modal de Finalização (Checagem forçada) */}
      <Modal isOpen={checklistModal.isOpen} onClose={() => {}} title="Validação Requerida">
        <div className="space-y-6">
          <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
            <p className="text-warning text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Movimento Bloqueado
            </p>
            <p className="text-warning/80 text-xs mt-1">Este card tenta entrar no estágio "{checklistModal.nextStage?.label}", que possui regras estritas de fechamento.</p>
          </div>
          
          <div className="space-y-3">
             <h4 className="text-sm font-bold text-text-primary">O que falta resolver:</h4>
             {checklistModal.blockers?.map((b,i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-surface-base border border-surface-border-subtle rounded-xl text-text-primary text-sm">
                   <input type="checkbox" className="mt-0.5 rounded border-surface-border-subtle bg-surface-raised cursor-pointer" />
                   <span className="flex-1 font-medium">{b}</span>
                </div>
             ))}
             <p className="text-xs text-text-muted italic pt-2">Marque as caixas acima para confirmar que você já lidou com essas pendências offline/no sistema.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setChecklistModal({isOpen: false})}>Cancelar Movimento</Button>
            <Button 
                className="flex-1 shadow-glow-purple" 
                onClick={async () => {
                   if(checklistModal.evento && checklistModal.nextStage) {
                      setEventos(prev => prev.map(e => e.id === checklistModal.evento!.id ? { ...e, status: checklistModal.nextStage!.id as any } : e));
                      await persistStageMove(checklistModal.evento.id, checklistModal.nextStage);
                      setChecklistModal({isOpen: false});
                   }
                }}>
                Confirmo (Mover Card)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Motivo de Perda */}
      <Modal isOpen={lostModal.isOpen} onClose={() => {}} title="Registrar Perda">
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">Poxa, uma pena! Por que este evento foi perdido?</p>
          <select 
             className="w-full bg-surface-base border border-surface-border rounded-xl p-3 text-text-primary focus:ring-2 focus:ring-brand-purple"
             value={lostModal.reason}
             onChange={e => setLostModal(prev => ({...prev, reason: e.target.value}))}
          >
             <option value="Preço/Orçamento Alto">Acharam muito caro</option>
             <option value="Data Indisponível">Nossa agenda lotada</option>
             <option value="Sem Resposta">Cliente sumiu (Ghosting)</option>
             <option value="Concorrente">Fechou com outro</option>
             <option value="Outro">Outro motivo</option>
          </select>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setLostModal({isOpen: false})}>Cancelar</Button>
            <Button 
              className="flex-1 bg-danger hover:bg-danger/80 text-white shadow-lg"
              onClick={async () => {
                   if(lostModal.evento && lostModal.nextStage) {
                      setEventos(prev => prev.map(e => e.id === lostModal.evento!.id ? { ...e, status: lostModal.nextStage!.id as any } : e));
                      await persistStageMove(lostModal.evento.id, lostModal.nextStage, { motivoPerda: lostModal.reason });
                      setLostModal({isOpen: false});
                   }
              }}>
              Registrar Cancelamento
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
