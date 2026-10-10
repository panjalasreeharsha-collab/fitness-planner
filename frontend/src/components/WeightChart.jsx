import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function WeightChart({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-slate-900">Weight progress</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#0f172a" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
