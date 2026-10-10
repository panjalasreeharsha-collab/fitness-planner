const cards = [
  { label: 'Calories', value: '2,525 kcal', accent: 'bg-emerald-500' },
  { label: 'Protein', value: '164 g', accent: 'bg-cyan-500' },
  { label: 'Carbs', value: '295 g', accent: 'bg-violet-500' },
  { label: 'Fats', value: '69 g', accent: 'bg-amber-500' },
];

export default function MacroCards({ plan }) {
  const values = [
    { label: 'Calories', value: `${plan.targetCalories.toLocaleString()} kcal`, accent: 'bg-emerald-500' },
    { label: 'Protein', value: `${plan.proteinGrams} g`, accent: 'bg-cyan-500' },
    { label: 'Carbs', value: `${plan.carbsGrams} g`, accent: 'bg-violet-500' },
    { label: 'Fats', value: `${plan.fatGrams} g`, accent: 'bg-amber-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {values.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.accent} text-sm font-bold text-white`}>
            {item.label.slice(0, 1)}
          </div>
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
