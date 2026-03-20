import React, { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface BarChartData {
  name: string;
  beneficeVentes: number;
  depenses: number;
  beneficeReel: number;
}

interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StableBarChartProps {
  data: BarChartData[];
  formatEuro: (value: number) => string;
}

interface StablePieChartProps {
  data: PieChartData[];
  formatEuro: (value: number) => string;
}

// Composant BarChart stable avec memo
export const StableBarChart = memo<StableBarChartProps>(({ data, formatEuro }) => {
  // Mémoriser les données pour éviter les re-renders inutiles
  const stableData = useMemo(() => data, [JSON.stringify(data)]);
  
  // Tooltip formatter mémorisé
  const tooltipFormatter = useMemo(() => {
    return (value: number) => formatEuro(value);
  }, [formatEuro]);

  // Style du tooltip mémorisé
  const tooltipStyle = useMemo(() => ({
    backgroundColor: '#1F2937',
    border: 'none',
    borderRadius: '8px'
  }), []);

  const labelStyle = useMemo(() => ({ color: '#fff' }), []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={stableData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip 
          formatter={tooltipFormatter}
          contentStyle={tooltipStyle}
          labelStyle={labelStyle}
        />
        <Legend />
        <Bar dataKey="beneficeVentes" name="Bénéfice Ventes" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="depenses" name="Dépenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="beneficeReel" name="Bénéfice Réel" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

StableBarChart.displayName = 'StableBarChart';

// Fonction de rendu de label pour PieChart
const renderPieLabel = (props: PieLabelRenderProps): string => {
  const { name, percent } = props;
  const displayName = name || 'Inconnu';
  const displayPercent = typeof percent === 'number' ? (percent * 100).toFixed(0) : '0';
  return `${displayName} (${displayPercent}%)`;
};

// Composant PieChart stable avec memo
export const StablePieChart = memo<StablePieChartProps>(({ data, formatEuro }) => {
  // Mémoriser les données avec index signature
  const stableData = useMemo(() => {
    return data.map(item => ({
      ...item,
      name: item.name,
      value: item.value
    }));
  }, [JSON.stringify(data)]);
  
  // Tooltip formatter mémorisé
  const tooltipFormatter = useMemo(() => {
    return (value: number) => formatEuro(value);
  }, [formatEuro]);

  // Style mémorisé
  const tooltipStyle = useMemo(() => ({
    backgroundColor: '#1F2937',
    border: 'none',
    borderRadius: '8px'
  }), []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={stableData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderPieLabel}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {stableData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={tooltipFormatter}
          contentStyle={tooltipStyle}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

StablePieChart.displayName = 'StablePieChart';
