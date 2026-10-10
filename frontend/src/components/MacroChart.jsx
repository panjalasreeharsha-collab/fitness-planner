import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];

export default function MacroChart({ plan }) {
  const data = [
    { name: 'Protein', value: plan.proteinGrams * 4 },
    { name: 'Carbs', value: plan.carbsGrams * 4 },
    { name: 'Fats', value: plan.fatGrams * 9 },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-slate-900">Macro breakdown</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} kcal`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
              {item.name}
            </div>
            <strong className="text-slate-900">{Math.round((item.value / plan.targetCalories) * 100)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
