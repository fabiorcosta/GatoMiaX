/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  DollarSign,
  ChevronRight,
  Menu,
  PieChart as PieChartIcon,
  CheckSquare,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from './lib/utils';
import { RECREADORES, SERVICES, MOCK_EVENTS, SEASONALITY_DATA } from './mockData';
import { Recreador, Service, Evento } from './types';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 mb-2 text-sm font-medium transition-all rounded-xl cursor-pointer",
      active 
        ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20" 
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </button>
);

const StatCard = ({ label, value, icon: Icon, colorClass, trend }: { label: string, value: string, icon: any, colorClass: string, trend?: string }) => (
  <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", colorClass)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'services' | 'team'>('dashboard');
  const [events, setEvents] = useState<Evento[]>(MOCK_EVENTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Event Form State
  const [newEvent, setNewEvent] = useState({
    cliente: '',
    valorTotal: 0,
    distanciaKm: 0,
    recreadoresIds: [] as string[],
    data: new Date().toISOString().split('T')[0]
  });

  // Calculation Logic
  const marginCalculation = useMemo(() => {
    const custoDeslocamento = newEvent.distanciaKm * 1.40;
    const custoEquipe = newEvent.recreadoresIds.reduce((acc, id) => {
      const recreador = RECREADORES.find(r => r.id === id);
      return acc + (recreador?.salario || 0);
    }, 0);
    const lucroLiquido = newEvent.valorTotal - custoEquipe - custoDeslocamento;
    const margemPercent = newEvent.valorTotal > 0 ? (lucroLiquido / newEvent.valorTotal) * 100 : 0;

    return { custoDeslocamento, custoEquipe, lucroLiquido, margemPercent };
  }, [newEvent]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Evento = {
      id: Math.random().toString(36).substr(2, 9),
      ...newEvent,
      custoDeslocamento: marginCalculation.custoDeslocamento,
      custoEquipe: marginCalculation.custoEquipe,
      lucroLiquido: marginCalculation.lucroLiquido
    };
    setEvents([event, ...events]);
    setNewEvent({ cliente: '', valorTotal: 0, distanciaKm: 0, recreadoresIds: [], data: new Date().toISOString().split('T')[0] });
    setActiveTab('dashboard');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] transition-transform duration-300 transform lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center mb-10 px-2">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center mr-3 shadow-inner">
              <span className="text-xl font-black text-black">GM</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Gato Mia</h1>
          </div>

          <nav className="flex-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={PlusCircle} 
              label="Novo Evento" 
              active={activeTab === 'events'} 
              onClick={() => setActiveTab('events')} 
            />
            <SidebarItem 
              icon={Briefcase} 
              label="Serviços" 
              active={activeTab === 'services'} 
              onClick={() => setActiveTab('services')} 
            />
            <SidebarItem 
              icon={Users} 
              label="Equipe" 
              active={activeTab === 'team'} 
              onClick={() => setActiveTab('team')} 
            />
          </nav>

          <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-pink mr-3 border-2 border-white/20" />
              <div>
                <p className="text-xs font-bold text-white">Victor Moretti</p>
                <p className="text-[10px] text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-30 flex items-center justify-between p-6 bg-[#F8F9FB]/80 backdrop-blur-md">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 bg-white rounded-xl shadow-sm">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            <div className="hidden md:block text-right">
              <p className="text-xs text-gray-500">Saldo Operacional</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(events.reduce((acc, e) => acc + e.lucroLiquido, 0))}</p>
            </div>
            <button className="p-2 bg-white rounded-xl shadow-sm relative">
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    label="Faturamento Total" 
                    value={formatCurrency(events.reduce((acc, e) => acc + e.valorTotal, 0))} 
                    icon={DollarSign} 
                    colorClass="bg-blue-500" 
                    trend="+12%"
                  />
                  <StatCard 
                    label="Lucro Líquido" 
                    value={formatCurrency(events.reduce((acc, e) => acc + e.lucroLiquido, 0))} 
                    icon={TrendingUp} 
                    colorClass="bg-green-500" 
                    trend="+8.4%"
                  />
                  <StatCard 
                    label="Eventos Realizados" 
                    value={events.length.toString()} 
                    icon={CheckSquare} 
                    colorClass="bg-brand-yellow" 
                  />
                  <StatCard 
                    label="Margem Média" 
                    value={`${events.length > 0 ? (events.reduce((acc, e) => acc + (e.lucroLiquido / e.valorTotal), 0) / events.length * 100).toFixed(1) : '0'}%`} 
                    icon={PieChartIcon} 
                    colorClass="bg-brand-pink" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-8 bg-white border border-gray-100 shadow-sm rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold">Sazonalidade (Faturamento)</h3>
                      <div className="flex space-x-2">
                        <span className="flex items-center text-xs text-gray-500">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1" /> Colônias
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" /> Comum
                        </span>
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SEASONALITY_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                          <Tooltip 
                            cursor={{ fill: '#F8FAFC' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {SEASONALITY_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.type === 'Colônia' ? '#FACC15' : '#E2E8F0'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl">
                    <h3 className="text-lg font-bold mb-6">Top Recreadores</h3>
                    <div className="space-y-6">
                      {RECREADORES.slice(4, 9).map((rec, idx) => (
                        <div key={rec.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 mr-4">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{rec.nome}</p>
                              <p className="text-xs text-gray-400">Nível {rec.nivel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">98%</p>
                            <p className="text-[10px] text-gray-400">Conversão</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl">
                  <h3 className="text-lg font-bold mb-6">Últimos Eventos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                          <th className="pb-4 px-4">Cliente</th>
                          <th className="pb-4 px-4">Data</th>
                          <th className="pb-4 px-4">Valor</th>
                          <th className="pb-4 px-4">Lucro</th>
                          <th className="pb-4 px-4">Margem</th>
                          <th className="pb-4 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {events.map((event) => (
                          <tr key={event.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-sm">{event.cliente}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">{event.data}</td>
                            <td className="py-4 px-4 text-sm font-medium">{formatCurrency(event.valorTotal)}</td>
                            <td className="py-4 px-4 text-sm font-bold text-green-600">{formatCurrency(event.lucroLiquido)}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full mr-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-brand-yellow" 
                                    style={{ width: `${(event.lucroLiquido / event.valorTotal * 100)}%` }} 
                                  />
                                </div>
                                <span className="text-xs font-bold">{(event.lucroLiquido / event.valorTotal * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded-full">
                                Concluído
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-black tracking-tight">Novo Evento Inteligente</h2>
                  <p className="text-gray-500">Calculadora de margem em tempo real para fechamentos rápidos.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleAddEvent} className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Cliente / Contrato</label>
                          <input 
                            type="text" 
                            required
                            value={newEvent.cliente}
                            onChange={(e) => setNewEvent({...newEvent, cliente: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
                            placeholder="Ex: Mariana Assad"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Data do Evento</label>
                          <input 
                            type="date" 
                            required
                            value={newEvent.data}
                            onChange={(e) => setNewEvent({...newEvent, data: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Valor do Evento (R$)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="number" 
                              required
                              value={newEvent.valorTotal || ''}
                              onChange={(e) => setNewEvent({...newEvent, valorTotal: Number(e.target.value)})}
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Distância (KM)</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="number" 
                              required
                              value={newEvent.distanciaKm || ''}
                              onChange={(e) => setNewEvent({...newEvent, distanciaKm: Number(e.target.value)})}
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
                              placeholder="0"
                            />
                          </div>
                          <p className="text-[10px] text-gray-400">Adicional: R$ 1,40/km (Ida e Volta)</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase">Seleção de Equipe</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {RECREADORES.map((rec) => (
                            <button
                              key={rec.id}
                              type="button"
                              onClick={() => {
                                const ids = newEvent.recreadoresIds.includes(rec.id)
                                  ? newEvent.recreadoresIds.filter(id => id !== rec.id)
                                  : [...newEvent.recreadoresIds, rec.id];
                                setNewEvent({...newEvent, recreadoresIds: ids});
                              }}
                              className={cn(
                                "p-3 text-left border rounded-2xl transition-all cursor-pointer",
                                newEvent.recreadoresIds.includes(rec.id)
                                  ? "bg-brand-yellow border-brand-yellow text-black shadow-md"
                                  : "bg-white border-gray-100 hover:border-brand-yellow/30"
                              )}
                            >
                              <p className="text-xs font-bold truncate">{rec.nome}</p>
                              <p className="text-[10px] opacity-60">R$ {rec.salario}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/10 cursor-pointer"
                      >
                        Salvar Evento
                      </button>
                    </form>
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 bg-brand-yellow rounded-3xl shadow-xl shadow-brand-yellow/20">
                      <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-black/80">Indicador de Margem</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold opacity-60">Valor Bruto</span>
                          <span className="font-bold">{formatCurrency(newEvent.valorTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold opacity-60">Custo Equipe</span>
                          <span className="font-bold text-red-700">-{formatCurrency(marginCalculation.custoEquipe)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold opacity-60">Deslocamento</span>
                          <span className="font-bold text-red-700">-{formatCurrency(marginCalculation.custoDeslocamento)}</span>
                        </div>
                        
                        <div className="pt-4 border-t border-black/10">
                          <p className="text-[10px] font-black uppercase mb-1">Lucro Líquido Estimado</p>
                          <h4 className="text-3xl font-black">{formatCurrency(marginCalculation.lucroLiquido)}</h4>
                        </div>

                        <div className="mt-6">
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span>Margem de Lucro</span>
                            <span>{marginCalculation.margemPercent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(0, Math.min(100, marginCalculation.margemPercent))}%` }}
                              className={cn(
                                "h-full transition-all duration-500",
                                marginCalculation.margemPercent > 40 ? "bg-green-600" : "bg-red-600"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Checklist Automático</h4>
                      <ul className="space-y-3">
                        <li className="flex items-center text-xs font-medium">
                          <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center mr-2">
                            <CheckSquare className="w-3 h-3 text-green-600" />
                          </div>
                          Contrato Assinado
                        </li>
                        <li className="flex items-center text-xs font-medium">
                          <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center mr-2">
                            <CheckSquare className="w-3 h-3 text-green-600" />
                          </div>
                          Equipe Confirmada ({newEvent.recreadoresIds.length})
                        </li>
                        <li className="flex items-center text-xs font-medium opacity-40">
                          <div className="w-4 h-4 rounded border border-gray-200 mr-2" />
                          Materiais Separados
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Gestão de Serviços 'Vivos'</h2>
                    <p className="text-gray-500">Catálogo de experiências e precificação sugerida.</p>
                  </div>
                  <button className="flex items-center px-6 py-3 bg-brand-pink text-white font-bold rounded-2xl shadow-lg shadow-brand-pink/20 hover:scale-105 transition-all cursor-pointer">
                    <PlusCircle className="w-5 h-5 mr-2" /> Novo Serviço
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SERVICES.map((service) => (
                    <div key={service.id} className="group p-8 bg-white border border-gray-100 shadow-sm rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-brand-yellow transition-colors">
                          <Award className="w-6 h-6 text-gray-400 group-hover:text-black" />
                        </div>
                        <span className="text-xs font-bold text-brand-pink bg-brand-pink/10 px-3 py-1 rounded-full">
                          Nível {service.nivelMinimo}+
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">{service.nome}</h4>
                      <p className="text-2xl font-black text-gray-900 mb-6">{formatCurrency(service.precoSugerido)}</p>
                      
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Materiais Necessários</p>
                        <div className="flex flex-wrap gap-2">
                          {service.checklist.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-50 text-[10px] font-bold rounded-lg border border-gray-100">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button className="w-full mt-8 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm cursor-pointer">
                        Editar Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Níveis de Recreadores</h2>
                    <p className="text-gray-500">Gestão de talentos e progressão salarial.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {[1, 2, 3].map((nivel) => (
                    <div key={nivel} className="p-6 bg-white border border-gray-100 rounded-3xl">
                      <h3 className="text-sm font-black uppercase mb-4">Nível {nivel}</h3>
                      <div className="space-y-3">
                        {RECREADORES.filter(r => r.nivel === nivel).map(rec => (
                          <div key={rec.id} className="flex items-center p-3 bg-gray-50 rounded-2xl">
                            <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-[10px] font-bold mr-3">
                              {rec.nome.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold">{rec.nome}</p>
                              <p className="text-[10px] text-gray-400">{formatCurrency(rec.salario)}/dia</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-6 bg-[#1A1A1A] text-white rounded-3xl flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-brand-yellow" />
                    </div>
                    <h3 className="font-bold mb-2">Novo Talento?</h3>
                    <p className="text-xs text-gray-400 mb-6">Cadastre recreadores e defina níveis com base em performance.</p>
                    <button className="px-6 py-2 bg-brand-yellow text-black font-bold rounded-xl text-xs cursor-pointer hover:bg-white transition-colors">
                      Cadastrar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
