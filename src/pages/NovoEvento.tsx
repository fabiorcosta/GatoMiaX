import { useState } from 'react';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Save, Car, Users, TrendingUp } from 'lucide-react';
import { CUSTO_KM, SALARIOS_POR_NIVEL } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { Recreador, Servico } from '@/types';

// Mocks para Fase 1
const mockRecreadores: Recreador[] = [
  { id: '1', nome: 'Lulu', nivel: 2, salario: SALARIOS_POR_NIVEL[2], ativo: true, totalEventos: 15, createdAt: '', updatedAt: '', conducao: true },
  { id: '2', nome: 'Panda', nivel: 3, salario: SALARIOS_POR_NIVEL[3], ativo: true, totalEventos: 41, createdAt: '', updatedAt: '', conducao: false },
  { id: '3', nome: 'Zeca', nivel: 1, salario: SALARIOS_POR_NIVEL[1], ativo: true, totalEventos: 5, createdAt: '', updatedAt: '', conducao: false },
];

const mockServicos: Servico[] = [
  { id: '1', nome: 'Pintura Facial', precoSugerido: 150, ativo: true, checklist: [], nivelMinimo: 1, createdAt: '', updatedAt: '' },
  { id: '2', nome: 'Oficina de Slime', precoSugerido: 250, ativo: true, checklist: [], nivelMinimo: 2, createdAt: '', updatedAt: '' },
];

export default function NovoEvento() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [distanciaKm, setDistanciaKm] = useState(10);
  const [valorCobrado, setValorCobrado] = useState(850);
  
  const [equipeSelecionada, setEquipeSelecionada] = useState<string[]>(['1', '2']); // Lulu e Panda default
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>(['1']);

  // Calculadora de Margem
  const custoEquipe = equipeSelecionada.reduce((acc, id) => {
    const rec = mockRecreadores.find(r => r.id === id);
    return acc + (rec?.salario || 0);
  }, 0);

  const custoDeslocamento = distanciaKm * CUSTO_KM;
  const custoTotal = custoEquipe + custoDeslocamento;
  const lucroLiquido = valorCobrado - custoTotal;
  const margemPercentual = valorCobrado > 0 ? (lucroLiquido / valorCobrado) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Novo Evento
          </h1>
          <p className="text-text-secondary mt-1">
            Calculadora de margem em tempo real e cadastro.
          </p>
        </div>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário - Ocupa 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
            <h3 className="font-display font-semibold mb-4 text-brand-yellow">1. Info do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Nome do Cliente" 
                placeholder="Ex: Maria Carolina" 
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
              />
              <Input 
                label="WhatsApp" 
                placeholder="(16) 9..." 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <Input 
                label="Data do Evento" 
                type="date"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
              />
            </div>
          </div>

          <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
            <h3 className="font-display font-semibold mb-4 text-brand-yellow">2. Logística & Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Valor Combinado (R$)" 
                type="number"
                value={valorCobrado}
                onChange={(e) => setValorCobrado(Number(e.target.value))}
              />
              <Input 
                label={`Distância Ida e Volta (km) - R$${CUSTO_KM}/km`} 
                type="number"
                value={distanciaKm}
                onChange={(e) => setDistanciaKm(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
            <h3 className="font-display font-semibold mb-4 text-brand-yellow">3. Escala da Equipe</h3>
            <div className="space-y-3">
              {mockRecreadores.map(rec => (
                <label key={rec.id} className="flex items-center p-3 rounded-lg border border-surface-border-subtle hover:bg-surface-hover cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-surface-border-subtle text-brand-purple focus:ring-brand-yellow"
                    checked={equipeSelecionada.includes(rec.id)}
                    onChange={(e) => {
                      if (e.target.checked) setEquipeSelecionada([...equipeSelecionada, rec.id]);
                      else setEquipeSelecionada(equipeSelecionada.filter(id => id !== rec.id));
                    }}
                  />
                  <span className="ml-3 flex-1 text-text-primary font-medium">{rec.nome} (Nível {rec.nivel})</span>
                  <span className="text-text-muted">{formatCurrency(rec.salario)}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
            <h3 className="font-display font-semibold mb-4 text-brand-yellow">4. Serviços Incluídos</h3>
            <div className="space-y-3">
              {mockServicos.map(serv => (
                <label key={serv.id} className="flex items-center p-3 rounded-lg border border-surface-border-subtle hover:bg-surface-hover cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-surface-border-subtle text-brand-purple focus:ring-brand-yellow"
                    checked={servicosSelecionados.includes(serv.id)}
                    onChange={(e) => {
                      if (e.target.checked) setServicosSelecionados([...servicosSelecionados, serv.id]);
                      else setServicosSelecionados(servicosSelecionados.filter(id => id !== serv.id));
                    }}
                  />
                  <span className="ml-3 flex-1 text-text-primary font-medium">{serv.nome}</span>
                  <span className="text-text-muted">{formatCurrency(serv.precoSugerido)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview (Calculadora de Margem) - Ocupa 1/3 (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-primary mb-2">Resumo Financeiro</h3>
            
            <StatCard
              title="Custo da Equipe"
              value={formatCurrency(custoEquipe)}
              icon={<Users className="w-5 h-5" />}
            />
            
            <StatCard
              title="Custo Deslocamento"
              value={formatCurrency(custoDeslocamento)}
              icon={<Car className="w-5 h-5" />}
            />

            <motion.div 
              key={lucroLiquido}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="card-gradient rounded-xl p-5 border-2 border-brand-yellow glow-yellow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-brand-yellow opacity-10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-medium text-brand-yellow">Lucro Previsto</h3>
                <TrendingUp className="w-5 h-5 text-brand-yellow" />
              </div>
              <p className="text-4xl font-display font-bold text-text-primary">
                {formatCurrency(lucroLiquido)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-surface-raised h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-yellow transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(0, margemPercentual))}%` }} 
                  />
                </div>
                <span className="text-sm font-bold text-brand-yellow">{margemPercentual.toFixed(1)}%</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
