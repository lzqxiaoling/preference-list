import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Person, Category } from '../types';

interface StatsChartProps {
  people: Person[];
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export const StatsChart: React.FC<StatsChartProps> = ({ people }) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(Category).forEach(c => counts[c] = 0);

    people.forEach(person => {
      person.preferences.forEach(pref => {
        if (counts[pref.category] !== undefined) {
          counts[pref.category]++;
        }
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [people]);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>;
  }

  return (
    <div className="h-72 w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">喜好类别分布</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};