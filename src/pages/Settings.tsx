import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, Filter, Clock, DollarSign, Users, PlusCircle, Trash2, Save, GripVertical } from 'lucide-react';
import { useConfig } from '@/lib/settings';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FunnelStage } from '@/types/settings';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableStage({ stage, onEdit, onDelete }: { stage: FunnelStage, onEdit: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 bg-surface-base border border-surface-border-subtle rounded-xl mb-3 ${isDragging ? 'shadow-2xl border-brand-purple' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-surface-hover p-1 rounded">
        <GripVertical className="w-5 h-5 text-text-muted" />
      </div>
      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
      <div className="flex-1">
        <p className="font-bold text-sm text-text-primary">{stage.label}</p>
        <div className="flex gap-2 mt-1">
          {stage.is_terminal && <span className="text-[10px] bg-danger/10 text-danger px-1.5 rounded font-black uppercase">Terminal</span>}
          {stage.triggers_recontact && <span className="text-[10px] bg-brand-yellow/10 text-brand-yellow px-1.5 rounded font-black uppercase">Recontato</span>}
          {stage.requires_payment_check && <span className="text-[10px] bg-brand-purple/10 text-brand-purple px-1.5 rounded font-black uppercase">Check PGTO</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-xs font-bold text-brand-purple hover:underline px-2">Editar</button>
        <button 
          onClick={onDelete} 
          disabled={stage.is_terminal} 
          className="text-xs font-bold text-danger hover:underline px-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:no-underline"
          title={stage.is_terminal ? "Estágios terminais não podem ser deletados facilmente" : "Excluir estágio"}
        >
          Remover
        </button>
      </div>
    </div>
  );
}


export default function Settings() {
  const { config, loading, save } = useConfig();
  const [activeTab, setActiveTab] = useState<'funnel' | 'automations' | 'financial' | 'team'>('funnel');
  
  // Local state for tabs to allow editing before saving
  const [localStages, setLocalStages] = useState<FunnelStage[]>([]);
  const [localAuto, setLocalAuto] = useState<any>({});
  const [localFin, setLocalFin] = useState<any>({});
  const [localTeam, setLocalTeam] = useState<any>({});
  const [localRecontact, setLocalRecontact] = useState<any>({});

  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Modal Stage
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Partial<FunnelStage>>({});

  useEffect(() => {
    if (!loading) {
      setLocalStages(config.funnel_stages || []);
      setLocalAuto(config.automation || {});
      setLocalFin(config.financial || {});
      setLocalTeam(config.team || {});
      setLocalRecontact(config.recontact || {});
    }
  }, [config, loading]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLocalStages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const moved = arrayMove(items, oldIndex, newIndex);
        // Update order props
        return moved.map((item, idx) => ({ ...item, order: idx }));
      });
    }
  };

  const handleSaveKanban = async () => {
    setSavingSection('funnel');
    await save({ funnel_stages: localStages });
    setSavingSection(null);
  };

  const handleSaveAutomations = async () => {
    setSavingSection('automations');
    await save({ automation: localAuto, recontact: localRecontact });
    setSavingSection(null);
  };

  const handleSaveFinancial = async () => {
    setSavingSection('financial');
    await save({ financial: localFin });
    setSavingSection(null);
  };

  const handleSaveTeam = async () => {
    setSavingSection('team');
    await save({ team: localTeam });
    setSavingSection(null);
  };

  const openNewStageModal = () => {
    setEditingStage({
      label: '', color: '#7F77DD', is_terminal: false, triggers_recontact: false, requires_payment_check: false
    });
    setIsStageModalOpen(true);
  };

  const saveStageModal = () => {
    if (!editingStage.label) return;
    
    if (editingStage.id) {
      // Edit
      setLocalStages(prev => prev.map(s => s.id === editingStage.id ? { ...s, ...editingStage } as FunnelStage : s));
    } else {
      // Add
      const slug = editingStage.label.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now();
      const newS: FunnelStage = {
        id: slug,
        label: editingStage.label,
        color: editingStage.color || '#000000',
        order: localStages.length,
        is_terminal: editingStage.is_terminal || false,
        triggers_recontact: editingStage.triggers_recontact,
        requires_payment_check: editingStage.requires_payment_check,
      };
      setLocalStages(prev => [...prev, newS]);
    }
    setIsStageModalOpen(false);
  };

  if (loading) {
    return <div className="p-8">Carregando configurações...</div>;
  }

  const tabs = [
    { id: 'funnel', icon: <Filter className="w-4 h-4" />, label: 'Funil de Vendas' },
    { id: 'automations', icon: <Clock className="w-4 h-4" />, label: 'Automações' },
    { id: 'financial', icon: <DollarSign className="w-4 h-4" />, label: 'Regras Financeiras' },
    { id: 'team', icon: <Users className="w-4 h-4" />, label: 'Regras de Equipe' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Configurações Gerais</h1>
        <p className="text-text-secondary mt-1">Motor de regras e infraestrutura do sistema GatoMiaX.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === t.id 
                ? 'bg-brand-purple text-text-primary shadow-glow-purple' 
                : 'text-text-muted hover:bg-surface-raised hover:text-text-primary'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Pane */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* Taba Funnel */}
            {activeTab === 'funnel' && (
              <motion.div key="funnel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center justify-between bg-brand-yellow/10 border border-brand-yellow/20 p-4 rounded-xl">
                  <div>
                    <h3 className="text-brand-yellow font-bold text-sm">Aviso Importante</h3>
                    <p className="text-xs text-brand-yellow/80">As alterações na ordem ou regras destas colunas afetam o Kanban imediatamente.</p>
                  </div>
                  <Button onClick={handleSaveKanban} isLoading={savingSection === 'funnel'} className="shrink-0">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Ordem
                  </Button>
                </div>

                <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display font-bold text-xl">Estágios do Funil</h2>
                    <Button variant="outline" onClick={openNewStageModal}>
                      <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Estágio
                    </Button>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localStages.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {localStages.map(stage => (
                        <SortableStage 
                          key={stage.id} 
                          stage={stage} 
                          onEdit={() => { setEditingStage(stage); setIsStageModalOpen(true); }}
                          onDelete={() => {
                            if (confirm('Atenção: Existem cards que podem estar vinculados a este status. Remova-os primeiro lá no Funil antes de deletá-lo. Excluir da config agora?')) {
                              setLocalStages(prev => prev.filter(s => s.id !== stage.id));
                            }
                          }}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </motion.div>
            )}

            {/* Tab Automations */}
            {activeTab === 'automations' && (
              <motion.div key="automations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="card-gradient rounded-xl p-6 border border-surface-border glass space-y-6">
                  <h2 className="font-display font-bold text-xl text-brand-purple">Tempo & Alertas</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Follow-up Orçamento (dias)" 
                      type="number" min="1"
                      value={localAuto.quote_followup_days}
                      onChange={e => setLocalAuto({...localAuto, quote_followup_days: Number(e.target.value)})}
                    />
                    <Input 
                      label="Alerta de Equipe Ausente (dias pré-festa)" 
                      type="number" min="1"
                      value={localAuto.team_alert_days}
                      onChange={e => setLocalAuto({...localAuto, team_alert_days: Number(e.target.value)})}
                    />
                    <Input 
                      label="Arquivamento Backlog (meses)" 
                      type="number" min="1"
                      value={localAuto.auto_archive_months}
                      onChange={e => setLocalAuto({...localAuto, auto_archive_months: Number(e.target.value)})}
                    />
                  </div>

                  <hr className="border-surface-border-subtle" />

                  <h2 className="font-display font-bold text-xl text-brand-purple">Recontato Inteligente</h2>
                  
                  <div className="flex items-center gap-3 p-4 bg-surface-base rounded-2xl border border-surface-border-subtle cursor-pointer hover:border-brand-purple/30" onClick={() => setLocalRecontact({ ...localRecontact, enabled: !localRecontact.enabled })}>
                    <div className={`w-10 h-6 shrink-0 rounded-full relative transition-all duration-300 ${localRecontact.enabled ? 'bg-success' : 'bg-surface-border'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${localRecontact.enabled ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary uppercase">Gerar Leads Automáticos</p>
                      <p className="text-[10px] text-text-muted">Cria cards novos em 'Novo Lead' após festas finalizadas visando upsell/retenção.</p>
                    </div>
                  </div>

                  {localRecontact.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-raised rounded-xl">
                      <Input 
                        label="Antecedência Aniversário (dias)" 
                        type="number" min="1"
                        value={localRecontact.days_before}
                        onChange={e => setLocalRecontact({...localRecontact, days_before: Number(e.target.value)})}
                      />
                      <Input 
                        label="Supressão Padrão (dias 'não perturbe')" 
                        type="number" min="1"
                        value={localRecontact.suppression_days}
                        onChange={e => setLocalRecontact({...localRecontact, suppression_days: Number(e.target.value)})}
                      />
                      <div className="col-span-full mt-2"><h4 className="font-bold text-xs text-brand-yellow uppercase tracking-widest">Regras Cliente VIP</h4></div>
                      <Input 
                        label="Ticket Mínimo VIP (R$)" 
                        type="number" min="0" step="100"
                        value={localRecontact.vip_threshold_brl}
                        onChange={e => setLocalRecontact({...localRecontact, vip_threshold_brl: Number(e.target.value)})}
                      />
                      <Input 
                        label="Antecedência VIP (dias)" 
                        type="number" min="1"
                        value={localRecontact.vip_days_before}
                        onChange={e => setLocalRecontact({...localRecontact, vip_days_before: Number(e.target.value)})}
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveAutomations} isLoading={savingSection === 'automations'} className="shadow-glow-purple">
                      <Save className="w-4 h-4 mr-2" /> Salvar Automações
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab Financial */}
            {activeTab === 'financial' && (
              <motion.div key="financial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="card-gradient rounded-xl p-6 border border-surface-border glass space-y-6">
                  <h2 className="font-display font-bold text-xl text-success">Regras Financeiras</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        Exigência de Sinal (%) - <span className="text-brand-yellow">{localFin.min_deposit_pct}%</span>
                      </label>
                      <input 
                        type="range" min="10" max="100" step="5"
                        value={localFin.min_deposit_pct}
                        onChange={e => setLocalFin({...localFin, min_deposit_pct: Number(e.target.value)})}
                        className="w-full accent-brand-yellow"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        Margem Mínima Segura (%) - <span className="text-danger">{localFin.min_margin_pct}%</span>
                      </label>
                      <input 
                        type="range" min="5" max="50" step="1"
                        value={localFin.min_margin_pct}
                        onChange={e => setLocalFin({...localFin, min_margin_pct: Number(e.target.value)})}
                        className="w-full accent-danger"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Gatilho Cobrança 2ª Parcela</label>
                      <select 
                        title="Gatilho"
                        className="w-full h-10 px-4 py-2 bg-surface-base border border-surface-border-subtle rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        value={localFin.second_payment_trigger}
                        onChange={e => setLocalFin({...localFin, second_payment_trigger: e.target.value})}
                      >
                        <option value="before_event">Antes do Evento</option>
                        <option value="day_of">No Dia do Evento (Padrão)</option>
                        <option value="after_event">Após o Evento</option>
                      </select>
                    </div>

                    <Input 
                      label="Offset de Cobrança (horas relativas)" 
                      type="number"
                      value={localFin.second_payment_offset_hours}
                      onChange={e => setLocalFin({...localFin, second_payment_offset_hours: Number(e.target.value)})}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveFinancial} isLoading={savingSection === 'financial'} className="shadow-glow-purple">
                      <Save className="w-4 h-4 mr-2" /> Salvar Regras
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab Team */}
            {activeTab === 'team' && (
              <motion.div key="team" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="card-gradient rounded-xl p-6 border border-surface-border glass space-y-6">
                  <h2 className="font-display font-bold text-xl text-info">Regras de Escala de Equipe</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Descanso Mín. entre Festas (horas)" 
                      type="number" min="0"
                      value={localTeam.rest_between_events_hours}
                      onChange={e => setLocalTeam({...localTeam, rest_between_events_hours: Number(e.target.value)})}
                    />
                    <Input 
                      label="Ratio: 1 Recreador para quantas Crianças?" 
                      type="number" min="1"
                      value={localTeam.ratio_recreador_children}
                      onChange={e => setLocalTeam({...localTeam, ratio_recreador_children: Number(e.target.value)})}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveTeam} isLoading={savingSection === 'team'} className="shadow-glow-purple">
                      <Save className="w-4 h-4 mr-2" /> Salvar Escala
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Modal Edição de Stage (Funil) */}
      <Modal isOpen={isStageModalOpen} onClose={() => setIsStageModalOpen(false)} title="Configurar Estágio">
        <div className="space-y-4 pt-2">
          <Input 
            label="Nome da Coluna"
            value={editingStage.label || ''}
            onChange={e => setEditingStage({ ...editingStage, label: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cor</label>
            <div className="flex items-center gap-3">
              <input 
                title="Cor da Fase"
                type="color" 
                value={editingStage.color || '#ffffff'} 
                onChange={e => setEditingStage({...editingStage, color: e.target.value})}
                className="w-10 h-10 rounded border-0 bg-transparent p-0 cursor-pointer"
              />
              <span className="text-xs font-mono bg-surface-base px-2 py-1 select-all">{editingStage.color || '#ffffff'}</span>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-surface-border-subtle">
            <label className="flex items-center gap-3 p-3 bg-surface-base rounded-xl border border-surface-border-subtle cursor-pointer hover:bg-surface-raised transition-colors">
              <input type="checkbox" className="w-4 h-4 bg-brand-purple rounded" checked={editingStage.is_terminal || false} onChange={e => setEditingStage({...editingStage, is_terminal: e.target.checked})} />
              <div className="flex-1">
                <span className="text-sm font-bold text-text-primary block">Estágio Terminal (Fim da linha)</span>
                <span className="text-xs text-text-muted">Cards não poderão ser movidos para frente após isso.</span>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 bg-surface-base rounded-xl border border-surface-border-subtle cursor-pointer hover:bg-surface-raised transition-colors">
              <input type="checkbox" className="w-4 h-4 bg-brand-purple rounded" checked={editingStage.triggers_recontact || false} onChange={e => setEditingStage({...editingStage, triggers_recontact: e.target.checked})} />
              <div className="flex-1">
                <span className="text-sm font-bold text-text-primary block">Gera Recontato Automático</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-surface-base rounded-xl border border-surface-border-subtle cursor-pointer hover:bg-surface-raised transition-colors">
              <input type="checkbox" className="w-4 h-4 bg-brand-purple rounded" checked={editingStage.requires_payment_check || false} onChange={e => setEditingStage({...editingStage, requires_payment_check: e.target.checked})} />
              <div className="flex-1">
                <span className="text-sm font-bold text-text-primary block">Exige Validação de Pagamento</span>
              </div>
            </label>
            
             <label className="flex items-center gap-3 p-3 bg-surface-base rounded-xl border border-surface-border-subtle cursor-pointer hover:bg-surface-raised transition-colors">
              <input type="checkbox" className="w-4 h-4 bg-brand-purple rounded" checked={editingStage.requires_team_payment || false} onChange={e => setEditingStage({...editingStage, requires_team_payment: e.target.checked})} />
              <div className="flex-1">
                <span className="text-sm font-bold text-text-primary block">Exige Validação de Equipe Paga</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsStageModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveStageModal}>Aplicar no Preview</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
