import { motion } from 'motion/react';
import { StatCard } from '@/components/ui/StatCard';
import { DollarSign, LineChart as LineChartIcon, Target, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function Dashboard() {
  // Mock data for Phase 1 - Componentization
  const kpis = {
    revenue: 4580.00,
    profit: 2200.00,
    events: 12,
    conversion: 65,
  };

  const dataFinanceiro = [
    { name: 'Jan', receita: 3000, lucro: 1200 },
    { name: 'Fev', receita: 4000, lucro: 1800 },
    { name: 'Mar', receita: 3500, lucro: 1500 },
    { name: 'Abr', receita: 4580, lucro: 2200 },
  ];

  const dataEventos = [
    { name: 'Jan', eventos: 8 },
    { name: 'Fev', eventos: 10 },
    { name: 'Mar', eventos: 9 },
    { name: 'Abr', eventos: 12 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="text-text-secondary">
          KPIs, gráficos de sazonalidade e visão geral do negócio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Faturamento Mensal"
          value={formatCurrency(kpis.revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 12, label: "vs mês passado", positive: true }}
          delay={0.1}
        />
        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(kpis.profit)}
          icon={<LineChartIcon className="w-5 h-5" />}
          trend={{ value: 8, label: "vs mês passado", positive: true }}
          delay={0.2}
        />
        <StatCard
          title="Eventos Realizados"
          value={kpis.events}
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: 2, label: "vs mês passado", positive: false }}
          delay={0.3}
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${kpis.conversion}%`}
          icon={<Target className="w-5 h-5" />}
          trend={{ value: 5, label: "vs mês passado", positive: true }}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
          <h3 className="font-display font-semibold mb-6">Receita vs Lucro</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataFinanceiro} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A2870" vertical={false} />
                <XAxis dataKey="name" stroke="#8A6EA0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A6EA0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip
                  cursor={{ fill: '#381F55' }}
                  contentStyle={{ backgroundColor: '#1A0E26', borderColor: '#4A2870', borderRadius: '0.5rem', color: '#F5F0FA' }}
                  itemStyle={{ color: '#F5F0FA' }}
                />
                <Bar dataKey="receita" name="Receita" fill="#6B2482" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill="#F7D117" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-gradient rounded-xl p-6 border border-surface-border glass">
          <h3 className="font-display font-semibold mb-6">Eventos por Mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataEventos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A2870" vertical={false} />
                <XAxis dataKey="name" stroke="#8A6EA0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A6EA0" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A0E26', borderColor: '#4A2870', borderRadius: '0.5rem', color: '#F5F0FA' }}
                  itemStyle={{ color: '#F5F0FA' }}
                />
                <Line type="monotone" dataKey="eventos" name="Eventos" stroke="#F7D117" strokeWidth={3} dot={{ r: 4, fill: '#1A0E26', stroke: '#F7D117', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
