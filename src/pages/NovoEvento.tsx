import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Save, Car, Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CUSTO_KM } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import type { Recreador, Servico, Evento } from '@/types';

export default function NovoEvento() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [distanciaKm, setDistanciaKm] = useState(10);
  const [valorCobrado, setValorCobrado] = useState(850);
  
  const [equipeSelecionada, setEquipeSelecionada] = useState<string[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);

  const [availableRecreadores, setAvailableRecreadores] = useState<Recreador[]>([]);
  const [availableServicos, setAvailableServicos] = useState<Servico[]>([]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'error' | 'success', message: string} | null>(null);

  // Fetch Ativos
  useEffect(() => {
    const qRec = query(collection(db, 'recreadores'), where('ativo', '==', true));
    const unsubRec = onSnapshot(qRec, (snap) => {
      setAvailableRecreadores(snap.docs.map(d => ({ id: d.id, ...d.data() } as Recreador)));
    });

    const qServ = query(collection(db, 'servicos'), where('ativo', '==', true));
    const unsubServ = onSnapshot(qServ, (snap) => {
      setAvailableServicos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Servico)));
    });

    return () => {
      unsubRec();
      unsubServ();
    };
  }, []);

  // Calculadora de Margem
  const custoEquipe = equipeSelecionada.reduce((acc, id) => {
    const rec = availableRecreadores.find(r => r.id === id);
    return acc + (rec?.salario || 0);
  }, 0);

  const custoDeslocamento = distanciaKm * CUSTO_KM;
  const custoTotal = custoEquipe + custoDeslocamento;
  const lucroLiquido = valorCobrado - custoTotal;
  const margemPercentual = valorCobrado > 0 ? (lucroLiquido / valorCobrado) * 100 : 0;

  const handleSalvar = async () => {
    if (!nomeCliente || !dataEvento || !valorCobrado) {
      setFeedback({ type: 'error', message: 'Preencha o Nome do Cliente, Data e Valor Combinado.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // 1. Criar novo cliente avulso
      const clienteRef = await addDoc(collection(db, 'clientes'), {
        nome: nomeCliente,
        whatsapp: whatsapp || '',
        totalEventos: 1,
        consentimento: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Preparar payload da Equipe
      const equipePayload = equipeSelecionada.map(id => {
        const rec = availableRecreadores.find(r => r.id === id);
        return {
          id: rec!.id,
          nome: rec!.nome,
          nivel: rec!.nivel,
          salario: rec!.salario
        };
      });

      // 3. Preparar payload de Serviços
      const servicosPayload = servicosSelecionados.map(id => {
        const serv = availableServicos.find(s => s.id === id);
        return {
          id: serv!.id,
          nome: serv!.nome,
          precoUnitario: serv!.precoSugerido
        };
      });

      // 4. Salvar Evento (Status "orcado" inicializa o Funil de Vendas)
      const novoEvento: Omit<Evento, 'id'> = {
        clienteId: clienteRef.id,
        clienteNome: nomeCliente,
        data: dataEvento,
        tipoEvento: 'festa', // Padrão
        valorTotal: valorCobrado,
        valorSinal: 0,
        sinalPago: false,
        restantePago: false,
        custoEquipe,
        custoDeslocamento,
        lucroLiquido,
        margemPercent: margemPercentual,
        distanciaKm,
        equipe: equipePayload,
        servicosContratados: servicosPayload,
        status: 'orcado',
        statusUpdatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        criadoPor: auth.currentUser?.uid || 'admin'
      };

      await addDoc(collection(db, 'eventos'), novoEvento);

      setFeedback({ type: 'success', message: 'Evento salvo e enviado ao Funil de Vendas com sucesso!' });
      
      // Limpa o formulário
      setTimeout(() => {
        setNomeCliente('');
        setWhatsapp('');
        setDataEvento('');
        setDistanciaKm(10);
        setValorCobrado(850);
        setEquipeSelecionada([]);
        setServicosSelecionados([]);
        setFeedback(null);
      }, 3000);

    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Erro ao salvar. Verifique a conexão com o banco.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Novo Evento</h1>
          <p className="text-text-secondary mt-1">Calculadora de margem em tempo real e cadastro.</p>
        </div>
        <Button className="gap-2" onClick={handleSalvar} isLoading={loading}>
          <Save className="w-4 h-4" />
          Salvar Evento
        </Button>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 font-medium text-sm border shadow-lg ${
            feedback.type === 'error' 
            ? 'bg-danger/10 border-danger/30 text-danger' 
            : 'bg-success/10 border-success/30 text-success'
          }`}
        >
          {feedback.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {feedback.message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                label={`Distância Ida e Volta (km) - R$${CUSTO_KM.toFixed(2)}/km`} 
                type="number"
                value={distanciaKm}
                onChange={(e) => setDistanciaKm(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
            <h3 className="font-display font-semibold mb-4 text-brand-yellow">3. Escala da Equipe</h3>
            <div className="space-y-3">
              {availableRecreadores.length === 0 ? (
                <p className="text-text-muted text-sm italic">Nenhum recreador ativo cadastrado no sistema.</p>
              ) : (
                availableRecreadores.map(rec => (
                  <label key={rec.id} className="flex items-center p-3 rounded-lg border border-surface-border-subtle hover:bg-brand-purple/10 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-surface-border-subtle text-brand-purple focus:ring-brand-purple bg-surface-base"
                      checked={equipeSelecionada.includes(rec.id)}
                      onChange={(e) => {
                        if (e.target.checked) setEquipeSelecionada([...equipeSelecionada, rec.id]);
                        else setEquipeSelecionada(equipeSelecionada.filter(id => id !== rec.id));
                      }}
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-text-primary font-bold">{rec.nome}</span>
                      <span className="ml-2 text-[10px] uppercase font-bold text-text-muted">Nível {rec.nivel}</span>
                    </div>
                    <span className="text-text-secondary font-black tracking-tighter">{formatCurrency(rec.salario)}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
            <h3 className="font-display font-semibold mb-4 text-brand-yellow">4. Serviços Incluídos</h3>
            <div className="space-y-3">
              {availableServicos.length === 0 ? (
                <p className="text-text-muted text-sm italic">Nenhum serviço ativo cadastrado no sistema.</p>
              ) : (
                availableServicos.map(serv => (
                  <label key={serv.id} className="flex items-center p-3 rounded-lg border border-surface-border-subtle hover:bg-brand-purple/10 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-surface-border-subtle text-brand-purple focus:ring-brand-purple bg-surface-base"
                      checked={servicosSelecionados.includes(serv.id)}
                      onChange={(e) => {
                        if (e.target.checked) setServicosSelecionados([...servicosSelecionados, serv.id]);
                        else setServicosSelecionados(servicosSelecionados.filter(id => id !== serv.id));
                      }}
                    />
                    <span className="ml-3 flex-1 text-text-primary font-bold">{serv.nome}</span>
                    <span className="text-text-secondary tracking-tighter">{formatCurrency(serv.precoSugerido)}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-primary mb-2">Resumo Financeiro</h3>
            
            <StatCard
              title="Custo da Equipe"
              value={formatCurrency(custoEquipe)}
              icon={<Users className="w-5 h-5 text-brand-yellow" />}
            />
            
            <StatCard
              title="Custo Deslocamento"
              value={formatCurrency(custoDeslocamento)}
              icon={<Car className="w-5 h-5 text-brand-yellow" />}
            />

            <motion.div 
              key={lucroLiquido}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="card-gradient rounded-2xl p-6 border-2 border-brand-yellow glow-yellow relative overflow-hidden mt-6"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-brand-yellow opacity-10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-brand-yellow uppercase tracking-widest text-xs">Lucro Previsto</h3>
                <TrendingUp className="w-5 h-5 text-brand-yellow" />
              </div>
              <p className="text-4xl font-display font-black text-text-primary tracking-tighter py-2">
                {formatCurrency(lucroLiquido)}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 bg-surface-raised h-2.5 rounded-full overflow-hidden border border-surface-border-subtle">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${margemPercentual < 30 ? 'bg-danger' : margemPercentual < 50 ? 'bg-warning' : 'bg-success'}`} 
                    style={{ width: `${Math.min(100, Math.max(0, margemPercentual))}%` }} 
                  />
                </div>
                <span className={`text-xs font-black tracking-widest ${margemPercentual < 30 ? 'text-danger' : margemPercentual < 50 ? 'text-warning' : 'text-success'}`}>
                  {margemPercentual.toFixed(1)}%
                </span>
              </div>
              {margemPercentual < 30 && (
                <p className="text-[10px] text-danger mt-2 font-bold uppercase">Atenção: Margem muito baixa!</p>
              )}
            </motion.div>

            <Button className="w-full h-12 text-sm font-black uppercase tracking-widest mt-4 shadow-glow-purple" onClick={handleSalvar} isLoading={loading}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Evento
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
