import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Check, Image as ImageIcon, Star, Plus } from 'lucide-react';
import type { Servico, Testimonial } from '@/types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Servico | null;
  onSave: (data: Partial<Servico>) => Promise<void>;
  servicosCadastrados?: Servico[]; // Para suggestions
}

const TABS = ['Essencial', 'Apresentação', 'Prova Social'];

export function ServiceModal({ isOpen, onClose, service, onSave, servicosCadastrados = [] }: ServiceModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Servico>>({
    nome: '',
    description: '',
    precoSugerido: 0,
    nivelMinimo: 1,
    ativo: true,
    gallery: [],
    tags: [],
    requiresPower: false,
    seasonalMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All year
    complementaryServiceIds: [],
    testimonials: [],
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  // Tag Input State
  const [tagInput, setTagInput] = useState('');
  
  // Testimonial inline form state
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimForm, setTestimForm] = useState({ clientName: '', text: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          ...service,
          description: service.description || service.descricao || '',
          gallery: service.gallery || [],
          tags: service.tags || [],
          requiresPower: service.requiresPower || false,
          seasonalMonths: service.seasonalMonths || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          complementaryServiceIds: service.complementaryServiceIds || [],
          testimonials: service.testimonials || [],
        });
      } else {
        setFormData({
          nome: '',
          description: '',
          precoSugerido: 0,
          nivelMinimo: 1,
          ativo: true,
          gallery: [],
          tags: [],
          requiresPower: false,
          seasonalMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          complementaryServiceIds: [],
          testimonials: [],
        });
      }
      setActiveTab(0);
      setErrors({});
      setShowTestimonialForm(false);
    }
  }, [isOpen, service]);

  const validateEssential = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.nome?.trim()) newErrors.nome = true;
    if (!formData.description?.trim()) newErrors.description = true;
    if (formData.precoSugerido === undefined || formData.precoSugerido < 0) newErrors.precoSugerido = true;
    if (!formData.nivelMinimo) newErrors.nivelMinimo = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeTab === 0 && !validateEssential()) return;
    setActiveTab((p) => Math.min(p + 1, 2));
  };

  const handleSave = async () => {
    if (!validateEssential()) {
      setActiveTab(0);
      return;
    }
    
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent | React.ChangeEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    if ('preventDefault' in e) e.preventDefault();
    
    const val = tagInput.trim().replace(',', '');
    if (val && !formData.tags?.includes(val)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }));
  };

  const addTestimonial = () => {
    if (!testimForm.clientName || !testimForm.text) return;
    
    const newT: Testimonial = {
      id: crypto.randomUUID(),
      clientName: testimForm.clientName,
      text: testimForm.text,
      date: testimForm.date,
    };
    
    setFormData(prev => ({ ...prev, testimonials: [...(prev.testimonials || []), newT] }));
    setShowTestimonialForm(false);
    setTestimForm({ clientName: '', text: '', date: new Date().toISOString().split('T')[0] });
  };

  const hasData = (tabIndex: number) => {
    if (tabIndex === 0) return formData.nome || formData.description || formData.precoSugerido;
    if (tabIndex === 1) return formData.imageUrl || (formData.tags && formData.tags.length > 0) || formData.durationMinutes;
    if (tabIndex === 2) return formData.testimonials && formData.testimonials.length > 0;
    return false;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Editar Serviço' : 'Novo Serviço'} className="max-w-2xl">
      <div className="flex flex-col h-[70vh]">
        
        {/* TAB HEADERS */}
        <div className="flex justify-between items-center bg-surface-base border border-surface-border-subtle rounded-xl p-1 mb-6">
          {TABS.map((label, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 relative py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 ${
                activeTab === index 
                  ? 'text-brand-yellow bg-surface-raised shadow-md' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {hasData(index) && <div className="w-1.5 h-1.5 rounded-full bg-success/80" />}
              {index + 1} · {label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
          <AnimatePresence mode="wait">
            
            {/* ABA 1: ESSENCIAL */}
            {activeTab === 0 && (
              <motion.div key="tab0" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex justify-between">
                    <span>Nome do Serviço <span className="text-danger">*</span></span>
                    {errors.nome && <span className="text-danger normal-case tracking-normal">Preenchimento obrigatório</span>}
                  </label>
                  <Input 
                    value={formData.nome || ''}
                    onChange={e => { setFormData(prev => ({ ...prev, nome: e.target.value })); setErrors(p => ({ ...p, nome: false })); }}
                    placeholder="Ex: Pintura Facial"
                    className={errors.nome ? 'border-danger focus:ring-danger' : ''}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex justify-between">
                    <span>Descrição Curta <span className="text-danger">*</span></span>
                    <span className={errors.description ? 'text-danger' : 'text-text-muted'}>
                      {(formData.description?.length || 0)}/160
                    </span>
                  </label>
                  <textarea 
                    value={formData.description || ''}
                    maxLength={160}
                    onChange={e => { setFormData(prev => ({ ...prev, description: e.target.value })); setErrors(p => ({ ...p, description: false })); }}
                    placeholder="Descreva o serviço..."
                    className={`w-full bg-surface-base border ${errors.description ? 'border-danger focus:ring-danger' : 'border-surface-border-subtle'} rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none h-24`}
                  />
                  <p className="text-[10px] text-text-secondary">Aparece no card do site e no WhatsApp.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex justify-between">
                      <span>Preço Sugerido <span className="text-danger">*</span></span>
                    </label>
                    <Input 
                      type="number"
                      value={formData.precoSugerido || 0}
                      onChange={e => { setFormData(prev => ({ ...prev, precoSugerido: Number(e.target.value) })); setErrors(p => ({ ...p, precoSugerido: false })); }}
                      className={errors.precoSugerido ? 'border-danger focus:ring-danger' : ''}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex justify-between">
                      <span>Nível Mínimo <span className="text-danger">*</span></span>
                    </label>
                    <select 
                      className={`w-full h-10 px-4 bg-surface-base border ${errors.nivelMinimo ? 'border-danger focus:ring-danger' : 'border-surface-border-subtle'} rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-purple`}
                      value={formData.nivelMinimo || 1}
                      onChange={e => { setFormData(prev => ({ ...prev, nivelMinimo: Number(e.target.value) as 1|2|3 })); setErrors(p => ({ ...p, nivelMinimo: false })); }}
                    >
                      <option value={1}>Nível 1 (Básico)</option>
                      <option value={2}>Nível 2 (Intermediário)</option>
                      <option value={3}>Nível 3 (Sênior)</option>
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

              </motion.div>
            )}

            {/* ABA 2: APRESENTAÇÃO */}
            {activeTab === 1 && (
              <motion.div key="tab1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                
                <div className="p-4 border-2 border-dashed border-surface-border-subtle rounded-2xl bg-surface-base/50 text-center">
                  <ImageIcon className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-text-secondary">Foto Principal</p>
                  <p className="text-xs text-text-muted mb-3">Imagem principal exibida no card do site (JPG/PNG até 5MB).</p>
                  <Input 
                    placeholder="URL da Imagem..." 
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Duração (minutos)</label>
                    <Input 
                      type="number" 
                      value={formData.durationMinutes || ''} 
                      onChange={e => setFormData(p => ({ ...p, durationMinutes: Number(e.target.value) }))} 
                    />
                    <p className="text-[10px] text-text-secondary">Exibido no orçamento e no card público.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Máx Crianças</label>
                    <Input 
                      type="number" 
                      value={formData.maxChildren || ''} 
                      onChange={e => setFormData(p => ({ ...p, maxChildren: Number(e.target.value) }))} 
                    />
                    <p className="text-[10px] text-text-secondary">Usado para alertar superlotação.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tags Visuais</label>
                  <Input 
                    placeholder="Digite e pressione Enter..." 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="bg-surface-raised px-2 py-1 rounded-md text-xs text-text-secondary flex items-center gap-1 border border-surface-border-subtle">
                          {tag} <X className="w-3 h-3 cursor-pointer text-danger/70 hover:text-danger" onClick={() => removeTag(tag)} />
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["ao ar livre", "criativo", "esportivo", "cultural"].filter(t => !formData.tags?.includes(t)).map(sug => (
                      <span key={sug} className="text-[10px] px-2 py-1 bg-surface-base border border-surface-border-subtle rounded-md cursor-pointer hover:border-brand-purple/50 text-text-muted" onClick={() => setFormData(p => ({ ...p, tags: [...(p.tags || []), sug] }))}>
                        + {sug}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Faixa Etária</label>
                    <div className="flex gap-2">
                      <Input placeholder="De" type="number" value={formData.ageMin || ''} onChange={e => setFormData(p => ({ ...p, ageMin: Number(e.target.value) }))} />
                      <Input placeholder="Até" type="number" value={formData.ageMax || ''} onChange={e => setFormData(p => ({ ...p, ageMax: Number(e.target.value) }))} />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-6">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData(p => ({ ...p, requiresPower: !p.requiresPower}))}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${formData.requiresPower ? 'bg-brand-purple text-text-inverse' : 'bg-surface-border-subtle'}`}>
                        {formData.requiresPower && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-semibold text-text-primary">Requer Energia Elétrica</span>
                    </div>
                  </div>
                </div>

                {(formData.requiresPower || (formData.setupMinutes && formData.setupMinutes > 0)) && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tempo de Montagem (minutos)</label>
                    <Input 
                      type="number" 
                      value={formData.setupMinutes || ''} 
                      onChange={e => setFormData(p => ({ ...p, setupMinutes: Number(e.target.value) }))} 
                    />
                    <p className="text-[10px] text-text-secondary">Adicionado automaticamente ao cronograma do evento.</p>
                  </div>
                )}

              </motion.div>
            )}

            {/* ABA 3: PROVA SOCIAL */}
            {activeTab === 2 && (
              <motion.div key="tab2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-raised/40 p-4 rounded-2xl border border-surface-border-subtle">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Vezes Executado</p>
                    <p className="text-2xl font-display font-bold text-text-primary">
                      {service?.timesExecuted ? service.timesExecuted : '—'}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-1">Calculado de eventos finalizados.</p>
                  </div>
                  <div className="bg-surface-raised/40 p-4 rounded-2xl border border-surface-border-subtle">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Avaliação Média</p>
                    {service?.avgRating ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-6 h-6 text-brand-yellow fill-brand-yellow" />
                        <span className="text-2xl font-display font-bold text-text-primary">{service.avgRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-text-muted mt-2">Ainda sem avaliações.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-text-primary">Depoimentos Publicados</h4>
                    {!showTestimonialForm && (
                      <Button variant="outline" className="h-8 text-xs py-0 px-3 gap-1" onClick={() => setShowTestimonialForm(true)}>
                        <Plus className="w-3 h-3" /> Adicionar
                      </Button>
                    )}
                  </div>

                  {showTestimonialForm && (
                    <div className="bg-surface-raised/80 p-4 rounded-xl border border-surface-border animate-in fade-in slide-in-from-top-2 space-y-3">
                      <Input placeholder="Nome do Cliente" value={testimForm.clientName} onChange={e => setTestimForm(p => ({ ...p, clientName: e.target.value }))} />
                      <textarea 
                        maxLength={280}
                        placeholder="O que o cliente achou?"
                        className="w-full bg-surface-base border border-surface-border-subtle rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none h-20"
                        value={testimForm.text}
                        onChange={e => setTestimForm(p => ({ ...p, text: e.target.value }))}
                      />
                      <Input type="date" value={testimForm.date} onChange={e => setTestimForm(p => ({ ...p, date: e.target.value }))} />
                      
                      <div className="flex gap-2 justify-end pt-2">
                        <Button variant="outline" className="h-8 text-xs px-4" onClick={() => setShowTestimonialForm(false)}>Cancelar</Button>
                        <Button className="h-8 text-xs px-4" onClick={addTestimonial}>Adicionar</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(!formData.testimonials || formData.testimonials.length === 0) && !showTestimonialForm && (
                      <div className="p-6 text-center border border-dashed border-surface-border-subtle rounded-xl text-text-muted text-sm">
                        Nenhum depoimento inserido.
                      </div>
                    )}
                    {formData.testimonials?.map(t => (
                      <div key={t.id} className="p-4 bg-surface-base rounded-xl border border-surface-border-subtle flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-brand-yellow/20 text-brand-yellow font-bold flex items-center justify-center shrink-0">
                          {t.clientName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-text-primary">{t.clientName} <span className="font-normal text-xs text-text-muted ml-2">{new Date(t.date as string).toLocaleDateString('pt-BR')}</span></p>
                          <p className="text-xs text-text-secondary mt-1 italic">"{t.text.length > 60 ? t.text.substring(0, 60) + '...' : t.text}"</p>
                        </div>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, testimonials: prev.testimonials?.filter(xt => xt.id !== t.id) }))}
                          className="p-2 text-text-muted hover:text-danger rounded-lg shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER NAVEGAÇÃO E SUMIT */}
        <div className="pt-4 border-t border-surface-border-subtle flex justify-between gap-3 shrink-0">
          <Button variant="outline" className="w-[120px]" onClick={onClose}>
            Cancelar
          </Button>

          <div className="flex gap-3">
            {activeTab < 2 && (
              <Button variant="outline" className="w-[120px]" onClick={handleNext}>
                Próximo →
              </Button>
            )}
            <Button 
              className="w-[120px] shadow-glow-purple" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '...' : 'Finalizar'}
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
