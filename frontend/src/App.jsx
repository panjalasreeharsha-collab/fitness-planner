import { useMemo, useState } from 'react';
import { Activity, ArrowRight, BadgeCheck, Dumbbell, Flame, Scale, UserRound } from 'lucide-react';
import MacroCards from './components/MacroCards';
import MacroChart from './components/MacroChart';
import WeightChart from './components/WeightChart';

const initialForm = {
  age: 30,
  gender: 'male',
  heightCm: 178,
  weightKg: 82,
  neckCm: 39,
  waistCm: 84,
  hipCm: 96,
  activityLevel: 'moderate',
  goal: 'lean-bulk',
};

const goalMeta = {
  cut: { label: 'Cut', description: 'Sustainable fat loss with a small calorie deficit.' },
  'lean-bulk': { label: 'Lean Bulk', description: 'Slow, clean weight gain while maintaining muscle.' },
  bulk: { label: 'Aggressive Bulk', description: 'Maximize calorie surplus to support stronger growth.' },
};

const activityLvl = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
};

const history = [
  { date: 'Jan 02', weight: 85.2 },
  { date: 'Jan 09', weight: 84.6 },
  { date: 'Jan 16', weight: 84.1 },
  { date: 'Jan 23', weight: 83.8 },
  { date: 'Jan 30', weight: 82.9 },
  { date: 'Feb 06', weight: 82.3 },
  { date: 'Feb 13', weight: 81.9 },
];

const defaultPlan = {
  bmr: 1856,
  tdee: 2870,
  targetCalories: 2620,
  proteinGrams: 164,
  carbsGrams: 300,
  fatGrams: 70,
  workoutSplitType: '4-Day Upper/Lower',
  bodyFat: 17.4,
};

export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState(defaultPlan);

  const workSplitText = useMemo(() => {
    if (form.goal === 'cut') return '4-Day Upper/Lower';
    if (form.goal === 'lean-bulk') return '5-Day Push/Pull/Legs';
    return '6-Day PPL';
  }, [form.goal]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const calculatePlan = () => {
    const weight = Number(form.weightKg);
    const height = Number(form.heightCm);
    const age = Number(form.age);
    const activityFactor = activityLvl[form.activityLevel] || 1.55;

    const bmr =
      form.gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = bmr * activityFactor;
    const targetCalories =
      form.goal === 'cut'
        ? Math.round(tdee - 500)
        : form.goal === 'lean-bulk'
          ? Math.round(tdee + 250)
          : Math.round(tdee + 500);

    const proteinGrams = Math.round(weight * 2);
    const fatGrams = Math.round((targetCalories * 0.22) / 9);
    const totalMacroCalories = proteinGrams * 4 + fatGrams * 9;
    const carbsGrams = Math.max(0, Math.round((targetCalories - totalMacroCalories) / 4));

    const bodyFat =
      form.gender === 'male'
        ? 495 / (1.0324 - 0.19077 * Math.log10(form.waistCm - form.neckCm) + 0.15456 * Math.log10(form.heightCm)) - 450
        : 495 / (1.29579 - 0.35004 * Math.log10(form.waistCm + form.hipCm - form.neckCm) + 0.221 * Math.log10(form.heightCm)) - 450;

    setPlan({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      workoutSplitType: workSplitText,
      bodyFat: Math.max(0, bodyFat).toFixed(1),
    });
  };

  const stepTitle = ['Biometrics', 'Goal & Activity'][step];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Fitness Planner</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Macro & training optimization</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
          <Activity className="h-4 w-4 text-emerald-600" />
          Personalized daily energy targets
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Step {step + 1}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{stepTitle}</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              <BadgeCheck className="h-4 w-4" />
              AI-generated plan
            </div>
          </div>

          {step === 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Age</span>
                <input type="number" value={form.age} onChange={(e) => updateField('age', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Gender</span>
                <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Height (cm)</span>
                <input type="number" value={form.heightCm} onChange={(e) => updateField('heightCm', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Weight (kg)</span>
                <input type="number" step="0.1" value={form.weightKg} onChange={(e) => updateField('weightKg', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Neck (cm)</span>
                <input type="number" step="0.1" value={form.neckCm} onChange={(e) => updateField('neckCm', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Waist (cm)</span>
                <input type="number" step="0.1" value={form.waistCm} onChange={(e) => updateField('waistCm', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Hips (cm)</span>
                <input type="number" step="0.1" value={form.hipCm} onChange={(e) => updateField('hipCm', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:bg-white" />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Activity level</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries({ sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', 'very-active': 'Very Active' }).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateField('activityLevel', value)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${form.activityLevel === value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Primary goal</label>
                <div className="space-y-3">
                  {Object.entries(goalMeta).map(([value, meta]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateField('goal', value)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${form.goal === value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{meta.label}</p>
                          <p className="mt-1 text-sm text-slate-600">{meta.description}</p>
                        </div>
                        {form.goal === value && <BadgeCheck className="h-5 w-5 text-emerald-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
              className="rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            {step === 0 ? (
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-800">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={calculatePlan} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-500">
                Generate plan <Flame className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <Dumbbell className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Recommendation</p>
                <h3 className="mt-1 text-xl font-semibold">{plan.workoutSplitType}</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">BMR</p>
                <p className="mt-2 text-2xl font-bold">{plan.bmr}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">TDEE</p>
                <p className="mt-2 text-2xl font-bold">{plan.tdee}</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-emerald-500/10 p-4 text-emerald-100">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Estimated body fat
              </div>
              <p className="mt-2 text-3xl font-bold">{plan.bodyFat}%</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-100 p-2">
                <UserRound className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Profile</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{goalMeta[form.goal].label} focus</h3>
              </div>
            </div>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              <li className="flex items-center justify-between">
                <span>Current goal</span>
                <span className="font-semibold text-slate-900">{goalMeta[form.goal].label}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Activity</span>
                <span className="font-semibold text-slate-900">{form.activityLevel}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Bodyweight</span>
                <span className="font-semibold text-slate-900">{form.weightKg} kg</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <main className="mt-10 space-y-8">
        <MacroCards plan={plan} />

        <div className="grid gap-8 xl:grid-cols-2">
          <MacroChart plan={plan} />
          <WeightChart data={history} />
        </div>
      </main>
    </div>
  );
}
